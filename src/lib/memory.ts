import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// BUG FIX #1: Model name harus prefixed dengan "models/"
// "text-embedding-004" → 404 error
// "models/text-embedding-004" → correct
const embeddingModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" })

export type MemoryType = 'trauma_trigger' | 'preference' | 'fact' | 'event' | 'coping_strategy' | 'journal_insight'

export interface ExtractedMemory {
  content: string
  type: MemoryType
  importance: number // 1-10
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function createEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

/**
 * saveMemory — Simpan memori ke agent_memory dengan vector embedding.
 * BUG FIX #2: Jika embedding gagal, fallback ke insert tanpa vector
 * agar memori tetap tersimpan (muncul di /memories tapi tidak bisa di-recall via semantic search).
 */
export async function saveMemory(
  userId: string,
  content: string,
  type: MemoryType,
  importance: number,
  source: string = 'chat'
) {
  const supabase = getSupabaseAdmin()

  try {
    // Attempt: save WITH vector embedding
    const embedding = await createEmbedding(content)
    const { error } = await supabase.rpc('remember_with_embedding', {
      p_user_id: userId,
      p_content: content,
      p_type: type,
      p_importance: importance,
      p_embedding: embedding
    })
    if (error) throw error
    console.log(`[memory] ✅ Saved with embedding: [${type}] importance=${importance}`)

  } catch (embeddingErr: any) {
    // Fallback: save WITHOUT embedding (text only)
    console.warn(`[memory] ⚠️ Embedding failed (${embeddingErr.message}), saving without vector...`)

    const { error: fallbackError } = await supabase
      .from('agent_memory')
      .insert({
        user_id: userId,
        content,
        type,
        importance,
        source,
        // embedding = NULL → entry muncul di getAllMemories tapi skip di match_memories
      })

    if (fallbackError) {
      console.error('[memory] ❌ Fallback insert also failed:', fallbackError)
      throw fallbackError
    }

    console.log(`[memory] ✅ Saved WITHOUT embedding (fallback): [${type}] importance=${importance}`)
  }
}

export async function recallMemories(userId: string, query: string, count = 5) {
  const supabase = getSupabaseAdmin()
  try {
    const queryEmbedding = await createEmbedding(query)
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: 0.65, // Turunkan dari 0.7 → 0.65 agar lebih banyak memori direcall
      match_count: count,
      p_user_id: userId
    })
    if (error) throw error
    return data || []
  } catch (err: any) {
    console.warn('[memory] recallMemories failed, returning empty:', err.message)
    return []
  }
}

export async function getAllMemories(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_memory')
    .select('id, content, type, importance, source, created_at')
    .eq('user_id', userId)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100) // Naikkan dari 50 → 100
  if (error) throw error
  return data || []
}

export async function deleteMemory(memoryId: string, userId: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('agent_memory')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', userId) // extra safety
  if (error) throw error
}

/**
 * extractAndSaveMemory — Gunakan Gemini untuk ekstrak fakta/preferensi baru
 * dari percakapan user, lalu simpan ke vector store.
 * Dipanggil async (non-blocking) setelah setiap agent response.
 *
 * BUG FIX #3: Prompt diperbarui untuk:
 * - Mendeteksi trauma dengan lebih sensitif (include kata "trauma", "takut", "ngeri", dsb.)
 * - Ekstrak hingga 3 fakta sekaligus (bukan hanya 1)
 * - Threshold importance diturunkan ke ≥ 4 untuk trauma_trigger (safety-critical)
 */
export async function extractAndSaveMemory(
  userId: string,
  userMessage: string,
  jiwoResponse: string
): Promise<void> {
  const extractModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const extractPrompt = `Kamu adalah sistem ekstraksi memori untuk AI companion mental health bernama Jiwo.
Analisis percakapan berikut dan ekstrak fakta-fakta PENTING tentang user.

User: "${userMessage}"
Jiwo: "${jiwoResponse}"

## PETUNJUK EKSTRAKSI

Ekstrak SEMUA fakta penting yang ditemukan (maksimal 3). Fokus pada:

**TRAUMA / TRIGGER** (type: "trauma_trigger", importance: 7-10)
Kata kunci: "trauma", "takut", "phobia", "pernah mengalami", "kejadian buruk", "ditinggal", "kehilangan", "kekerasan", "abused", "luka batin", "insecure", "pelecehan", "kecelakaan", "kematian orang terdekat"
→ Ini PALING PENTING. Selalu catat jika ada.

**PREFERENSI** (type: "preference", importance: 5-8)
Kata kunci: "suka", "benci", "ga mau", "prefer", "lebih senang", "tidak nyaman dengan", "ingin"

**FAKTA DIRI** (type: "fact", importance: 4-7)
Kata kunci: pekerjaan, kota, keluarga, status, kondisi kesehatan, usia, pendidikan

**STRATEGI COPING** (type: "coping_strategy", importance: 6-9)
Kata kunci: "berhasil", "membantu", "tenang setelah", "biasanya kalau stres aku", "ampuh"

## FORMAT RESPONS

Jika ada fakta, balas HANYA dengan JSON array:
[
  {"content": "...", "type": "trauma_trigger", "importance": 9},
  {"content": "...", "type": "preference", "importance": 6}
]

Jika TIDAK ADA fakta baru yang penting, balas: null

## CONTOH

User: "saya punya trauma waktu kecil ditinggal sendirian di rumah"
→ [{"content": "User memiliki trauma masa kecil: pernah ditinggal sendirian di rumah, kemungkinan menyebabkan rasa takut ditinggalkan (abandonment issues)", "type": "trauma_trigger", "importance": 9}]

User: "aku kerja di startup, biasanya kalau stres aku jalan-jalan dulu"
→ [{"content": "User bekerja di startup", "type": "fact", "importance": 5}, {"content": "Jalan-jalan efektif sebagai teknik coping saat user stres", "type": "coping_strategy", "importance": 7}]

User: "halo gimana kabar?"
→ null`

  const result = await extractModel.generateContent(extractPrompt)
  const rawText = result.response.text().trim()

  if (!rawText || rawText === 'null' || rawText === 'NULL') {
    console.log('[memory] No extractable facts from this message.')
    return
  }

  // Parse JSON — clean up markdown code blocks if present
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  let extracted: ExtractedMemory[]
  try {
    const parsed = JSON.parse(cleaned)
    // Handle both single object and array
    extracted = Array.isArray(parsed) ? parsed : [parsed]
  } catch (parseErr) {
    console.warn('[memory] Failed to parse extraction JSON:', rawText)
    return
  }

  const validTypes: MemoryType[] = ['trauma_trigger', 'preference', 'fact', 'event', 'coping_strategy', 'journal_insight']

  // Save each extracted memory
  for (const item of extracted) {
    if (!item?.content || !item?.type || item?.importance == null) continue
    if (!validTypes.includes(item.type)) continue

    // BUG FIX #3: Threshold berbeda per type
    // trauma_trigger → simpan jika importance ≥ 4 (safety-critical, jangan sampai terlewat)
    // type lain → importance ≥ 5
    const minImportance = item.type === 'trauma_trigger' ? 4 : 5
    if (item.importance < minImportance) {
      console.log(`[memory] Skipped (importance ${item.importance} < ${minImportance}): ${item.content.substring(0, 50)}`)
      continue
    }

    console.log(`[memory] Extracting: [${item.type}] importance=${item.importance}: ${item.content.substring(0, 60)}...`)
    await saveMemory(userId, item.content, item.type, item.importance, 'auto_extract')
  }
}
