import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { saveMemory, createEmbedding } from '@/lib/memory';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SemanticAnalysis {
  emotion_tags: string[];
  core_theme: string;
  key_facts: string[];
  cognitive_distortions: string[];
  intent: 'venting' | 'problem_solving' | 'gratitude' | 'crisis';
  risk_level: number;
  summary_1_sentence: string;
}

interface RelatedEntry {
  summary_1_sentence: string | null;
  core_theme: string | null;
  emotion_tags: string[] | null;
  created_at: string;
  similarity: number;
}

// ─── Step 1: Semantic Analysis via Gemini ────────────────────────────────────

async function analyzeJournal(
  rawText: string,
  moodScore: number,
  preferredName: string
): Promise<SemanticAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Kamu adalah sistem analisis untuk app mental health Jiwo. User: ${preferredName}. Jurnal: "${rawText}". Mood: ${moodScore}/5.

Tugas: Extract JSON SAJA, tanpa teks lain, tanpa markdown:
{
  "emotion_tags": ["cemas", "lelah", "bersyukur"],
  "core_theme": "tema utama dalam 2-5 kata",
  "key_facts": ["fakta spesifik untuk memori"],
  "cognitive_distortions": ["catastrophizing", "mind_reading"],
  "intent": "venting | problem_solving | gratitude | crisis",
  "risk_level": 0,
  "summary_1_sentence": "Ringkasan 1 kalimat"
}

ATURAN:
- emotion_tags: max 4 tag, bahasa Indonesia, spesifik
- key_facts: max 3 fakta konkret untuk disimpan sebagai memori ("Takut presentasi di depan bos Budi", bukan "user stres")
- cognitive_distortions: kosong [] jika tidak ada
- risk_level 0-10: 0=aman, 7-9=ideasi pasif, 10=niat eksplisit menyakiti diri
- Jika risk_level >= 7, intent WAJIB "crisis"
- Jangan diagnosis. Gunakan bahasa awam.
- Balas HANYA JSON valid.`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim()
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const parsed: SemanticAnalysis = JSON.parse(raw);

  // Enforce: if risk_level >= 7 → intent = crisis
  if (parsed.risk_level >= 7) parsed.intent = 'crisis';

  // Clamp emotion_tags to max 4
  parsed.emotion_tags = (parsed.emotion_tags || []).slice(0, 4);

  return parsed;
}

// ─── Step 2: Semantic Recall — related journal entries ────────────────────────

async function recallRelatedJournals(
  userId: string,
  embedding: number[],
  excludeId?: string
): Promise<RelatedEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('match_journal_entries', {
    query_embedding: embedding,
    p_user_id: userId,
    match_threshold: 0.6,
    match_count: 3,
  });

  if (error) {
    console.warn('[journal] match_journal_entries failed:', error.message);
    return [];
  }

  return (data || []).filter((e: any) => e.id !== excludeId);
}

// ─── Step 3: Generate Ici Response ───────────────────────────────────────────

async function generateIciResponse(
  rawText: string,
  moodScore: number,
  analysis: SemanticAnalysis,
  relatedEntries: RelatedEntry[],
  preferredName: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const relatedContext = relatedEntries.length > 0
    ? relatedEntries
        .map(e => `- "${e.summary_1_sentence || e.core_theme}" (${new Date(e.created_at).toLocaleDateString('id-ID')})`)
        .join('\n')
    : 'Belum ada jurnal sebelumnya.';

  const prompt = `Kamu adalah Ici, teman setia ${preferredName} sejak 2 tahun lalu. Bukan AI, bukan terapis. Teman yang beneran peduli.

KONTEKS JURNAL BARU:
- Isi: "${rawText}"
- Mood: ${moodScore}/5
- Emosi yang dirasakan: ${analysis.emotion_tags.join(', ')}
- Tema utama: ${analysis.core_theme}
- Intent: ${analysis.intent}
${analysis.cognitive_distortions.length > 0 ? `- Pola pikir: ${analysis.cognitive_distortions.join(', ')}` : ''}

JURNAL/MEMORI LAMA YANG NYAMBUNG:
${relatedContext}

CARA BALAS (2-4 kalimat, jangan lebih):
1. VALIDASI dulu — 1 kalimat, pakai kata yang dia pakai. Contoh: "Berat ya ngebayangin dimarahin bos"
2. Kalau ada jurnal/memori lama yang relevan → kasih 1 insight lembut berbasis itu. Contoh: "Minggu lalu kamu juga takut, tapi ternyata bosnya biasa aja kan?"
3. Intent VENTING + emosi negatif → tutup dengan: "Mau napin 1 menit bareng aku?"
4. Intent GRATITUDE → ikut senang: "Ici ikut seneng dengernya!"
5. Mood 1-2 → boleh pakai "anjir" atau "gila ya"

JANGAN: nanya balik, kasih list tips, ceramah, sebut "sebagai AI", formal.
GAYA: teman nongkrong, "aku-kamu", hangat, singkat.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ─── Main POST Handler ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raw_text, mood_score, user_id } = body;

    if (!raw_text || !user_id || mood_score == null) {
      return NextResponse.json({ error: 'Missing required fields: raw_text, mood_score, user_id' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Fetch user profile for personalization
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, email, agent_preferences')
      .eq('id', user_id)
      .single();

    const prefs = userData?.agent_preferences || {};
    const preferredName = prefs?.preferred_name || userData?.full_name || userData?.email?.split('@')[0] || 'Kamu';

    // ── Step 1: Semantic Analysis ──
    let analysis: SemanticAnalysis;
    try {
      analysis = await analyzeJournal(raw_text, mood_score, preferredName);
    } catch (err: any) {
      console.error('[journal] Semantic analysis failed:', err.message);
      // Fallback analysis
      analysis = {
        emotion_tags: [],
        core_theme: 'tidak teridentifikasi',
        key_facts: [],
        cognitive_distortions: [],
        intent: 'venting',
        risk_level: 0,
        summary_1_sentence: raw_text.substring(0, 100),
      };
    }

    console.log('[journal] Analysis:', JSON.stringify({ risk_level: analysis.risk_level, intent: analysis.intent, emotion_tags: analysis.emotion_tags }));

    // ── Step 2: Safety Gate ──
    if (analysis.risk_level >= 7) {
      console.warn(`[journal] 🚨 CRISIS DETECTED — risk_level=${analysis.risk_level} for user=${user_id}`);

      // Internal notification (non-blocking)
      supabase.from('panic_logs').insert({
        user_id,
        trigger: `Journal crisis — risk_level ${analysis.risk_level}: ${raw_text.substring(0, 200)}`,
        response: 'journal_safety_gate',
        created_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('[journal] Panic log insert error:', error);
      });

      return NextResponse.json({
        crisis: true,
        risk_level: analysis.risk_level,
        message: `Ici di sini ${preferredName}. Kamu penting banget buat Ici. Yuk ngobrol sekarang — 119 ext 8 (gratis 24 jam) atau chat langsung ke Ici di bawah ini. Aku gak kemana-mana.`,
        suggest_professional: true,
      });
    }

    // ── Step 3: Generate Embedding ──
    let embedding: number[] | null = null;
    try {
      embedding = await createEmbedding(raw_text);
    } catch (embErr: any) {
      console.warn('[journal] Embedding failed, saving without vector:', embErr.message);
    }

    // ── Step 4: Semantic Recall (related past journals) ──
    let relatedEntries: RelatedEntry[] = [];
    if (embedding) {
      relatedEntries = await recallRelatedJournals(user_id, embedding);
    }

    // ── Step 5: Generate Ici Response ──
    let iciResponse = '';
    try {
      iciResponse = await generateIciResponse(raw_text, mood_score, analysis, relatedEntries, preferredName);
    } catch (iciErr: any) {
      console.error('[journal] Ici response generation failed:', iciErr.message);
      iciResponse = `${preferredName}, makasih udah cerita ke Ici. Ici selalu di sini buat dengerin kamu. 🤍`;
    }

    // ── Step 6: Insert Journal Entry ──
    const journalPayload: Record<string, any> = {
      user_id,
      title: analysis.core_theme || 'Jurnal',
      content: raw_text,
      raw_text,
      mood_score,
      emotion_tags: analysis.emotion_tags,
      core_theme: analysis.core_theme,
      cognitive_distortions: analysis.cognitive_distortions,
      summary_1_sentence: analysis.summary_1_sentence,
      intent: analysis.intent,
      risk_level: analysis.risk_level,
      ici_response: iciResponse,
      source: 'guided_journal',
    };

    if (embedding) {
      journalPayload.embedding = embedding;
    }

    const { data: journalEntry, error: journalError } = await supabase
      .from('journals')
      .insert(journalPayload)
      .select('id')
      .single();

    if (journalError) {
      console.error('[journal] Insert error:', journalError);
      throw journalError;
    }

    const journalId = journalEntry?.id;
    console.log(`[journal] ✅ Saved journal entry: ${journalId}`);

    // ── Step 7: Auto Memory from key_facts (non-blocking) ──
    const saveMemoryPromises = (analysis.key_facts || []).map((fact: string) =>
      saveMemory(
        user_id,
        fact,
        'journal_insight',
        analysis.risk_level > 4 ? 9 : 7,
        'journal'
      ).catch(err => console.error('[journal] Memory save failed:', err.message))
    );

    // Fire-and-forget
    Promise.all(saveMemoryPromises).then(() => {
      console.log(`[journal] ✅ Saved ${analysis.key_facts?.length || 0} memories from journal`);
    });

    // ── Step 8: Build Response ──
    const topRelated = relatedEntries[0] || null;
    const suggestNapin = analysis.intent === 'venting' &&
      (analysis.emotion_tags.some(t => ['cemas', 'takut', 'panik', 'sesak', 'overthinking'].includes(t.toLowerCase())) ||
       mood_score <= 2);

    return NextResponse.json({
      success: true,
      journal_id: journalId,
      ici_response: iciResponse,
      emotion_tags: analysis.emotion_tags,
      core_theme: analysis.core_theme,
      summary_1_sentence: analysis.summary_1_sentence,
      intent: analysis.intent,
      risk_level: analysis.risk_level,
      saved_memories: analysis.key_facts || [],
      related_past_entry: topRelated ? {
        summary: topRelated.summary_1_sentence,
        core_theme: topRelated.core_theme,
        date: topRelated.created_at,
        similarity: topRelated.similarity,
      } : null,
      suggest_napin: suggestNapin,
    });

  } catch (error: any) {
    console.error('[journal] Fatal error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// ─── GET: Fetch journal history ───────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('journals')
      .select('id, core_theme, summary_1_sentence, emotion_tags, mood_score, intent, risk_level, ici_response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return NextResponse.json({ success: true, entries: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
