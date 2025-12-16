import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ref_code } = body;

    if (!ref_code) {
      return NextResponse.json(
        { error: 'Missing ref_code' },
        { status: 400 }
      );
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('ref_code', ref_code)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment to paid
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // Handle subscription or booking
    if (payment.payment_type === 'subscription') {
      const { plan_id } = payment.metadata || {};
      if (plan_id) {
        const { data: plan } = await supabase
          .from('plans')
          .select('*')
          .eq('id', plan_id)
          .single();

        if (plan) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration_days);

          await supabase
            .from('subscriptions')
            .insert({
              user_id: payment.user_id,
              plan_id,
              status: 'active',
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              payment_ref: payment.ref_code,
            });
        }
      }
    } else if (payment.payment_type === 'booking') {
      const { booking_id } = payment.metadata || {};
      if (booking_id) {
        await supabase
          .from('bookings')
          .update({
            status: 'paid',
            payment_ref: payment.ref_code,
          })
          .eq('id', booking_id);

        const { data: booking } = await supabase
          .from('bookings')
          .select('user_id, professional_id')
          .eq('id', booking_id)
          .single();

        if (booking) {
          await supabase
            .from('chat_channels')
            .insert({
              user_id: booking.user_id,
              professional_id: booking.professional_id,
              booking_id,
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment marked as paid',
      payment_id: payment.id,
    });
  } catch (error: any) {
    console.error('Test success error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
