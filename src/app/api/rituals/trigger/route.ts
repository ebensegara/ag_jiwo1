import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

// Vercel Cron calls this endpoint
// 00:30 UTC = 07:30 WIB → morning_pulse
// 15:00 UTC = 22:00 WIB → night_dump
export async function GET(request: NextRequest) {
  // Verify it's a cron call (Vercel adds this header)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const utcHour = new Date().getUTCHours();
  const utcMinute = new Date().getUTCMinutes();

  let ritualType: 'morning_pulse' | 'night_dump';
  let message: string;

  if (utcHour === 0 && utcMinute >= 30) {
    // 07:30 WIB
    ritualType = 'morning_pulse';
    message = 'Pagi! Energi kamu hari ini 1-5 berapa?';
  } else if (utcHour === 15) {
    // 22:00 WIB
    ritualType = 'night_dump';
    message = 'Waktunya buang sampah otak. Mau cerita apa yang masih kepikiran hari ini?';
  } else {
    return NextResponse.json({ skipped: true, utcHour, utcMinute });
  }

  // Get all users with active rituals of this type
  const { data: rituals, error } = await supabase
    .from('rituals')
    .select('id, user_id')
    .eq('type', ritualType)
    .eq('is_active', true);

  if (error) {
    console.error('Rituals query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rituals || rituals.length === 0) {
    return NextResponse.json({ triggered: 0, message: 'No active rituals' });
  }

  // Log the ritual trigger for each user
  const logs = rituals.map((r) => ({
    ritual_id: r.id,
    user_id: r.user_id,
    content: message,
  }));

  const { error: logError } = await supabase.from('ritual_logs').insert(logs);
  if (logError) console.error('Ritual log insert error:', logError);

  return NextResponse.json({
    success: true,
    ritualType,
    triggered: rituals.length,
    message,
  });
}

// POST: User manually triggers or logs a ritual (e.g. Night Dump submission)
export async function POST(request: NextRequest) {
  try {
    const { userId, ritualType, content } = await request.json();
    if (!userId || !ritualType) {
      return NextResponse.json({ error: 'Missing userId or ritualType' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find or create ritual for user
    let { data: ritual } = await supabase
      .from('rituals')
      .select('id')
      .eq('user_id', userId)
      .eq('type', ritualType)
      .maybeSingle();

    if (!ritual) {
      const { data: newRitual } = await supabase
        .from('rituals')
        .insert({ user_id: userId, type: ritualType, is_active: true })
        .select('id')
        .single();
      ritual = newRitual;
    }

    // Log completion
    const { error: logError } = await supabase.from('ritual_logs').insert({
      ritual_id: ritual?.id,
      user_id: userId,
      content: content || '',
    });

    if (logError) throw logError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ritual POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
