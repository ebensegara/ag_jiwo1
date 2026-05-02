import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" })

export type MemoryType = 'trauma_trigger' | 'preference' | 'fact' | 'event' | 'coping_strategy'

export interface ExtractedMemory {
  content: string
  type: MemoryType
  importance: number // 1-10
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function createEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

export async function saveMemory(
  userId: string,
  content: string,
  type: MemoryType,
  importance: number,
  source: string = 'chat'
) {
  const supabase = getSupabaseAdmin()
  const embedding = await createEmbedding(content)
  const { error } = await supabase.rpc('remember_with_embedding', {
    p_user_id: userId,
    p_content: content,
    p_type: type,
    p_importance: importance,
    p_embedding: embedding
  })
  if (error) throw error
}

export async function recallMemories(userId: string, query: string, count = 5) {
  const supabase = getSupabaseAdmin()
  const queryEmbedding = await createEmbedding(query)
  const { data, error } = await supabase.rpc('match_memories', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: count,
    p_user_id: userId
  })
  if (error) throw error
  return data || []
}

export async function getAllMemories(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_memory')
    .select('id, content, type, importance, created_at')
    .eq('user_id', userId)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)
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
 */
export async function extractAndSaveMemory(
  userId: string,
  userMessage: string,
  jiwoResponse: string
): Promise<void> {
  const extractModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const extractPrompt = `Analisis chat ini dan ekstrak SATU fakta terpenting tentang user jika ada.

User: "${userMessage}"
Jiwo: "${jiwoResponse}"

Tugasmu: Cari informasi baru tentang user seperti:
- Hal yang dia TAKUT/TRAUMA (type: trauma_trigger, importance: 7-10)
- Hal yang dia SUKA/BENCI (type: preference, importance: 5-8)
- Fakta tentang dirinya (type: fact, importance: 4-7)
- Teknik coping yang berhasil (type: coping_strategy, importance: 6-9)

Jika ada fakta baru, balas HANYA dengan JSON:
{"content": "...", "type": "preference|fact|trauma_trigger|coping_strategy", "importance": 7}

Jika tidak ada fakta baru yang penting, balas: null

Contoh:
- User: "aku benci lift" → {"content": "User benci naik lift, kemungkinan claustrophobia atau trauma", "type": "preference", "importance": 8}
- User: "capek banget hari ini" → null (tidak cukup spesifik)`

  const result = await extractModel.generateContent(extractPrompt)
  const rawText = result.response.text().trim()

  if (!rawText || rawText === 'null' || rawText === 'NULL') return

  // Parse JSON — clean up markdown code blocks if present
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const extracted: ExtractedMemory = JSON.parse(cleaned)

  if (!extracted?.content || !extracted?.type || !extracted?.importance) return

  const validTypes: MemoryType[] = ['trauma_trigger', 'preference', 'fact', 'event', 'coping_strategy']
  if (!validTypes.includes(extracted.type)) return

  // Only save if importance >= 5 (filter out noise)
  if (extracted.importance < 5) return

  await saveMemory(userId, extracted.content, extracted.type, extracted.importance, 'auto_extract')
}
