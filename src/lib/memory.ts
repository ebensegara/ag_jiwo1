import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Centralized model configuration
const EMBEDDING_MODEL_NAME = "models/gemini-embedding-001"
const OUTPUT_DIMENSION = 768

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

/**
 * createEmbedding — Menghasilkan vector 768-dimensi menggunakan Gemini.
 * Kita memaksa outputDimensionality: 768 agar konsisten dengan DB index limits.
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
    const result = await model.embedContent({
      content: { parts: [{ text: text }] },
      outputDimensionality: OUTPUT_DIMENSION,
    });
    
    if (!result.embedding || !result.embedding.values) {
      throw new Error("Embedding response empty");
    }
    
    console.log(`[memory] Embedding generated: ${result.embedding.values.length} dimensions using ${EMBEDDING_MODEL_NAME}`);
    
    // Matryoshka Truncation: Take first 768 dims for DB compatibility
    return result.embedding.values.slice(0, OUTPUT_DIMENSION);
  } catch (error: any) {
    console.error(`[memory] Embedding generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * saveMemory — Simpan memori ke agent_memory dengan vector embedding.
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
    console.warn(`[memory] ⚠️ Embedding failed (${embeddingErr.message}), saving without vector...`)

    const { error: fallbackError } = await supabase
      .from('agent_memory')
      .insert({
        user_id: userId,
        content,
        type,
        importance,
        source,
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
      match_threshold: 0.65,
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
    .limit(100)
  if (error) throw error
  return data || []
}

export async function deleteMemory(memoryId: string, userId: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('agent_memory')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function extractAndSaveMemory(
  userId: string,
  userMessage: string,
  jiwoResponse: string
): Promise<void> {
  const extractModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const extractPrompt = `Kamu adalah sistem ekstraksi memori untuk AI companion mental health bernama Jiwo.
Analisis percakapan berikut dan ekstrak fakta-fakta PENTING tentang user.

User: "${userMessage}"
Jiwo: "${jiwoResponse}"

## PETUNJUK EKSTRAKSI

Ekstrak SEMUA fakta penting yang ditemukan (maksimal 3). Fokus pada:

**TRAUMA / TRIGGER** (type: "trauma_trigger", importance: 7-10)
Kata kunci: "trauma", "takut", "phobia", "pernah mengalami", "kejadian buruk", "ditinggal", "kehilangan", "kekerasan", "abused", "luka batin", "insecure", "pelecehan", "kecelakaan", "kematian orang terdekat"
→ Ini PALING PENTING. Selalu catat jika ada.

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

Jika TIDAK ADA fakta baru yang penting, balas: null`

  const result = await extractModel.generateContent(extractPrompt)
  const rawText = result.response.text().trim()

  if (!rawText || rawText === 'null' || rawText === 'NULL') {
    return
  }

  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  let extracted: ExtractedMemory[]
  try {
    const parsed = JSON.parse(cleaned)
    extracted = Array.isArray(parsed) ? parsed : [parsed]
  } catch (parseErr) {
    return
  }

  const validTypes: MemoryType[] = ['trauma_trigger', 'preference', 'fact', 'event', 'coping_strategy', 'journal_insight']

  for (const item of extracted) {
    if (!item?.content || !item?.type || item?.importance == null) continue
    if (!validTypes.includes(item.type)) continue

    const minImportance = item.type === 'trauma_trigger' ? 4 : 5
    if (item.importance < minImportance) continue

    await saveMemory(userId, item.content, item.type, item.importance, 'auto_extract')
  }
}
