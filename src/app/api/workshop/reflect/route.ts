import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveMemory } from '@/lib/memory';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase configuration missing');
  return createClient(supabaseUrl, supabaseServiceKey);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { workshopId, userId, reflectionNote } = await request.json();

    if (!workshopId || !userId || !reflectionNote) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. Update registration status
    const { error: updateError } = await supabase
      .from('workshop_registrations')
      .update({
        reflection_note: reflectionNote,
        status: 'attended',
        checkin_at: new Date().toISOString()
      })
      .eq('workshop_id', workshopId)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // 2. Fetch workshop title for context
    const { data: workshop } = await supabase
      .from('art_workshops')
      .select('title')
      .eq('id', workshopId)
      .single();

    // 3. Analyze reflection with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Analisis refleksi user setelah mengikuti workshop "${workshop?.title || 'Seni'}".
    
    Refleksi User: "${reflectionNote}"
    
    Ekstrak 1 kalimat inti tentang apa yang user rasakan atau pelajari.
    Gunakan sudut pandang orang ketiga (contoh: "User merasa lega setelah...")
    Juga berikan skor importance (1-10) berdasarkan seberapa dalam insight emosionalnya.
    
    Balas HANYA dengan JSON:
    { "fact": "...", "importance": 8 }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let analysis = { fact: reflectionNote, importance: 7 };
    try {
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.warn('Failed to parse Gemini response for reflection:', responseText);
    }

    // 4. Save to workshop_memories
    await supabase.from('workshop_memories').insert({
      user_id: userId,
      workshop_id: workshopId,
      content: analysis.fact,
      importance: analysis.importance
    });

    // 5. Save to agent_memory (for general context)
    await saveMemory(userId, analysis.fact, 'journal_insight', analysis.importance, 'workshop_reflection');

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    console.error('Workshop Reflection Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
