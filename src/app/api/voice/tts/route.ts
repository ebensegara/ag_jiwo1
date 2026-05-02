import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

    // ElevenLabs voice mapping
    const VOICE_MAP: Record<string, string> = {
      female_1: 'cgSgspJ2msm6clMCkdW9', // Aria — warm, friendly
      female_2: 'EXAVITQu4vr4xnSDxMaL', // Bella — soft
      male_1: 'TxGEqnHWrfWFTfGW9XjX',   // Josh — deep
      default: 'cgSgspJ2msm6clMCkdW9',
    };

    const voiceId = VOICE_MAP[voice_id] || VOICE_MAP.default;

    if (elevenlabsKey) {
      // Use ElevenLabs
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': elevenlabsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.4,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ElevenLabs error: ${response.status} — ${errText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(audioBuffer).toString('base64');

      return NextResponse.json({
        success: true,
        audioBase64: base64,
        mimeType: 'audio/mpeg',
        provider: 'elevenlabs',
      });
    }

    // Fallback: return text for client-side Web Speech API
    return NextResponse.json({
      success: true,
      audioBase64: null,
      text, // client will use SpeechSynthesis
      provider: 'webspeech',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'TTS failed', message: error.message },
      { status: 500 }
    );
  }
}
