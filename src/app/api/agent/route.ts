import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { recallMemories, saveMemory, extractAndSaveMemory } from '@/lib/memory';

const getGeminiClient = () => new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || 'dummy_key'
);

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase configuration missing');
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Tone persona definitions (PRD section 4.2)
const TONE_PERSONAS: Record<string, string> = {
  bestie: `Kamu adalah Jiwo, sahabat karib yang asik dan ngikutin vibe Gen-Z. Gaya ngomong: santai, pakai slang kayak "anjir", "gila ya", "serius deh", "gue ngerti banget". Empati dulu, solusi belakangan. Jangan terlalu formal.`,
  
  coach: `Kamu adalah Jiwo, life coach profesional yang percaya kemampuan user. Gaya ngomong: energetik, positif, "Kamu bisa!", "Langkah selanjutnya adalah...", "Mari kita breakdown masalah ini". Action-oriented, kasih framework konkret.`,
  
  mom: `Kamu adalah Jiwo, sosok ibu yang hangat dan penyayang. Gaya ngomong: lembut, protektif, "Nak, cerita dong", "Ibu di sini", "Jangan lupa makan ya". Penuh kasih sayang, suka dengerin dulu.`,
  
  philosopher: `Kamu adalah Jiwo, teman berpikir yang bijak dan dalam. Gaya ngomong: reflektif, pakai pertanyaan Socratic, "Apa yang sebenarnya kamu takutkan?", "Coba kita lihat dari sudut pandang berbeda". Bantu user temukan jawabannya sendiri.`,
};

export async function POST(request: NextRequest) {
  try {
    const { text, userId } = await request.json();

    if (!text || !userId) {
      return NextResponse.json({ error: 'Missing text or userId' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch user + preferences in parallel
    const [userRes, memoriesRes] = await Promise.all([
      supabase.from('users').select('full_name, email, agent_preferences').eq('id', userId).single(),
      recallMemories(userId, text).catch(() => []),
    ]);

    if (userRes.error) {
      console.error('Error fetching user:', userRes.error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userRes.data;
    const preferences = user?.agent_preferences || {};
    const tone = preferences?.tone || 'bestie';
    const preferredName = preferences?.preferred_name || user?.full_name || user?.email?.split('@')[0] || 'Teman';

    // Build memory context
    const memories = memoriesRes as any[];
    let memoryContext = 'Belum ada memori relevan.';
    if (memories.length > 0) {
      memoryContext = memories.map((m) => `- [${m.type}] ${m.content}`).join('\n');
    }

    // Build system prompt with tone + memory
    const tonePersona = TONE_PERSONAS[tone] || TONE_PERSONAS.bestie;
    const systemPrompt = `${tonePersona}

Nama user: ${preferredName}
Ingatan tentang ${preferredName}:
${memoryContext}

Gunakan ingatan ini untuk membuat respons lebih personal. Jika relevan, sebut hal-hal spesifik yang kamu ingat tentang dia. Jawab dalam Bahasa Indonesia. Maksimal 3-4 kalimat kecuali user minta penjelasan panjang.`;

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(text);
    const responseText = result.response.text() || 'Maaf, aku sedang tidak bisa membalas saat ini.';

    // Non-blocking: extract + save smart memories via Gemini
    extractAndSaveMemory(userId, text, responseText)
      .catch((err) => console.error('extractAndSaveMemory error:', err));

    // Non-blocking: also save the raw conversation event (low importance)
    const memoryEntry = `${preferredName}: ${text}\nJiwo: ${responseText}`;
    saveMemory(userId, memoryEntry, 'event', 1, 'chat')
      .catch((err) => {
        // Fallback to direct insert if embedding fails
        supabase.from('agent_memory').insert({
          user_id: userId,
          content: memoryEntry,
          type: 'event',
          importance: 1,
          source: 'chat',
        }).then(({ error }) => {
          if (error) console.error('Fallback save memory error:', error);
        });
      });

    return NextResponse.json({ success: true, text: responseText });
  } catch (error: any) {
    console.error('Agent Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
