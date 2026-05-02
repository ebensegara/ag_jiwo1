import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert file to base64 for Gemini multimodal
    const audioBytes = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(audioBytes).toString('base64');
    const mimeType = audioFile.type || 'audio/webm';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Audio,
        },
      },
      {
        text: 'Transkripsi audio ini ke teks Bahasa Indonesia. Hanya output teks transkripsi saja, tanpa komentar atau penjelasan tambahan.',
      },
    ]);

    const text = result.response.text().trim();

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error('Transcribe error:', error);
    return NextResponse.json(
      { error: 'Transcription failed', message: error.message },
      { status: 500 }
    );
  }
}
