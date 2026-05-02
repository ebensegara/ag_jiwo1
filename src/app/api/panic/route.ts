import { NextRequest, NextResponse } from 'next/server';
import { recallMemories, saveMemory } from '@/lib/memory';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. AMBIL DATA PARALLEL biar cepet <1s
    // Database schema: journals (with mood_id → moods), panic_logs, agent_memory, users
    const [
      lastJournalRes,
      lastMoodRes,
      lastPanicRes,
      relevantMemories,
      userRes
    ] = await Promise.all([
      // Ambil jurnal terakhir
      supabase
        .from('journals')
        .select('title, content, mood_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Ambil mood terakhir dari tabel moods
      supabase
        .from('moods')
        .select('mood_value, mood_label, note, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Ambil panic log terakhir
      supabase
        .from('panic_logs')
        .select('trigger, resolved, techniques_used, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Recall memori relevan dari vector store
      recallMemories(userId, 'panic attack coping strategy breathing successful', 3).catch(() => []),

      // Ambil nama user
      supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle()
    ]);

    // 2. BUILD CONTEXT
    const lastMood = lastMoodRes.data;
    const lastJournal = lastJournalRes.data;
    const lastPanic = lastPanicRes.data;
    const userName = userRes.data?.full_name || 'Teman';

    // Coping strategies dari vector memory
    const copingStrategies = (relevantMemories as any[])
      .filter((m) => m.type === 'coping_strategy')
      .map((m) => m.content)
      .join(', ') || '4-7-8 breathing';

    // Ringkasan mood
    const moodSummary = lastMood
      ? `Mood terakhir ${lastMood.mood_value}/5 (${lastMood.mood_label})${lastMood.note ? ` — catatan: "${lastMood.note}"` : ''}`
      : 'Mood belum tercatat';

    // Ringkasan jurnal
    const journalSummary = lastJournal
      ? `Jurnal terakhir berjudul "${lastJournal.title}"`
      : 'Belum ada jurnal';

    // Ringkasan panic sebelumnya
    let panicHistory = 'Ini pertama kali';
    if (lastPanic) {
      const daysAgo = Math.floor((Date.now() - new Date(lastPanic.created_at).getTime()) / 86400000);
      const techniques = lastPanic.techniques_used?.join(', ') || 'tidak tercatat';
      panicHistory = `${daysAgo} hari lalu, trigger: ${lastPanic.trigger}, teknik berhasil: ${techniques}`;
    }

    // 3. BUILD SYSTEM PROMPT
    const systemPrompt = `Kamu adalah Jiwo, teman setia ${userName} di aplikasi kesehatan mental.
${userName} baru saja menekan tombol PANIC BUTTON. Mereka butuh bantuan SEKARANG JUGA.

Konteks yang kamu tahu tentang ${userName}:
- ${moodSummary}
- ${journalSummary}
- Riwayat panik sebelumnya: ${panicHistory}
- Teknik yang terbukti berhasil: ${copingStrategies}

TUGAS:
1. Validasi perasaan mereka dengan EMPATI dalam 1 kalimat pendek ("Aku di sini, ${userName}.")
2. Langsung pandu teknik napas yang PERNAH BERHASIL untuk mereka
3. Gunakan kalimat SANGAT PENDEK (max 2 kalimat per pesan)
4. Bahasa Indonesia yang hangat dan natural, seperti teman
5. JANGAN tanya "kenapa panik?" — langsung tolong

Mulai SEKARANG. Jangan tanya dulu.`;

    // 4. GENERATE RESPONSE
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent("Tolong aku, aku panik.");
    const responseText = result.response.text() || 'Aku di sini. Tarik napas pelan... hembuskan... kita lakukan sama-sama.';

    // 5. LOG PANIC EVENT (optional, non-blocking — table mungkin belum ada)
    supabase.from('panic_logs').insert({
      user_id: userId,
      trigger: 'pending_user_input',
      hr_before: null
    }).then(({ error: logError }) => {
      if (logError) console.error('panic_log insert skipped:', logError.message);
    });

    // 6. SAVE KE VECTOR MEMORY (async, tidak blocking response)
    saveMemory(userId, `${userName} menekan panic button. Jiwo merespons dengan panduan napas: ${responseText}`, 'event', 3)
      .catch((err) => console.error('Error saving panic memory:', err));

    return NextResponse.json({
      success: true,
      text: responseText,
    });

  } catch (error: any) {
    console.error('Panic API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
