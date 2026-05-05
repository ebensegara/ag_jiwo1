import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createEmbedding } from '@/lib/memory';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase configuration missing');
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. Fetch upcoming workshops
    const { data: upcoming, error: upcomingError } = await supabase
      .from('art_workshops')
      .select('*')
      .gt('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10);

    if (upcomingError) throw upcomingError;

    // 2. Semantic Recommendation
    // Fetch last 7 days journals and moods
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [journalsRes, moodsRes] = await Promise.all([
      supabase.from('journals').select('content').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('moods').select('note, mood_label').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString()),
    ]);

    const contextText = [
      ...(journalsRes.data?.map(j => j.content) || []),
      ...(moodsRes.data?.map(m => `${m.mood_label}: ${m.note}`) || [])
    ].join(' ');

    let recommended = null;
    let recommendationReason = "";

    // TEMPORARY: Disable Semantic Recommendation to ensure stability
    /*
    if (contextText.trim()) {
      const embedding = await createEmbedding(contextText);
      const { data: matchData, error: matchError } = await supabase.rpc('match_workshops', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 1
      });

      if (!matchError && matchData && matchData.length > 0) {
        recommended = matchData[0];
        // ... reason logic ...
      }
    }
    */

    // Simple Fallback: Recommend the first upcoming workshop
    if (upcoming && upcoming.length > 0) {
      recommended = upcoming[0];
      recommendationReason = "Ici rasa workshop ini pas buat nambah habit positif kamu minggu ini.";
    }

    return NextResponse.json({
      upcoming: upcoming || [],
      recommended_for_you: recommended,
      recommendation_reason: recommendationReason
    });

  } catch (error: any) {
    console.error('Workshop List Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
