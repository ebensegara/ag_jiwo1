import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { saveMemory } from '@/lib/memory';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase configuration missing');
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { workshopId, userId } = await request.json();

    if (!workshopId || !userId) {
      return NextResponse.json({ error: 'Missing workshopId or userId' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. Check workshop and participants
    const { data: workshop, error: workshopError } = await supabase
      .from('art_workshops')
      .select('*')
      .eq('id', workshopId)
      .single();

    if (workshopError || !workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const { count, error: countError } = await supabase
      .from('workshop_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId)
      .eq('status', 'registered');

    if (countError) throw countError;

    if (count !== null && count >= workshop.max_participant) {
      return NextResponse.json({ error: 'Workshop is full' }, { status: 400 });
    }

    // 2. Register user
    const { error: regError } = await supabase
      .from('workshop_registrations')
      .insert({
        workshop_id: workshopId,
        user_id: userId,
        status: 'registered'
      });

    if (regError) {
      if (regError.code === '23505') {
        return NextResponse.json({ error: 'Already registered' }, { status: 400 });
      }
      throw regError;
    }

    // 3. Save memory
    const scheduledDate = new Date(workshop.scheduled_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long'
    });
    const memoryText = `User mendaftar workshop "${workshop.title}" untuk tanggal ${scheduledDate}`;
    await saveMemory(userId, memoryText, 'event', 5, 'workshop_registration');

    // 4. Generate calendar link (simple data URI for .ics)
    const startDate = new Date(workshop.scheduled_at).toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(new Date(workshop.scheduled_at).getTime() + workshop.duration_min * 60000).toISOString().replace(/-|:|\.\d+/g, '');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Workshop Bareng Ici: ${workshop.title}
DESCRIPTION:${workshop.description}
LOCATION:${workshop.zoom_link || 'Online'}
END:VEVENT
END:VCALENDAR`;

    const calendarLink = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

    return NextResponse.json({ 
      success: true, 
      calendar_link: calendarLink 
    });

  } catch (error: any) {
    console.error('Workshop Registration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
