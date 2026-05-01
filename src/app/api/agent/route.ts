import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiClient = () => new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || 'dummy_key'
);


function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { text, userId } = await request.json();

    if (!text || !userId) {
      return NextResponse.json({ error: 'Missing text or userId' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch user details to get name
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = user?.full_name || user?.email?.split('@')[0] || 'User';

    // Fetch top 5 recent memories
    const { data: memories, error: memoryError } = await supabase
      .from('agent_memory')
      .select('content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (memoryError) {
      console.error('Error fetching memories:', memoryError);
    }

    const memoryContext = memories && memories.length > 0
      ? memories.map((m) => `- ${m.content}`).join('\n')
      : 'Belum ada memori.';

    // Construct the system prompt
    const systemPrompt = `Kamu Jiwo, temen ${userName} yang inget memori ini:\n${memoryContext}\nBerikan balasan yang suportif, ramah, dan menenangkan, apalagi kalau temanmu sedang panik. Berikan jawaban dalam bahasa Indonesia.`;

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(text);
    const responseText = result.response.text() || 'Maaf, aku sedang tidak bisa membalas saat ini.';

    // Return the text response
    return NextResponse.json({
      success: true,
      text: responseText,
    });
  } catch (error: any) {
    console.error('Agent Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
