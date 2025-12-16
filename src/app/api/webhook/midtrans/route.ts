import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const midtransServerKey = process.env.MIDTRANS_SERVER_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${midtransServerKey}`)
    .digest('hex');
  return hash === signatureKey;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Midtrans webhook received:', body);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      console.error('Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('ref_code', order_id)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', order_id);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Determine payment status
    let paymentStatus = 'pending';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        paymentStatus = 'paid';
      }
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'expire' ||
      transaction_status === 'cancel'
    ) {
      paymentStatus = 'failed';
    }

    console.log('Updating payment status:', { order_id, paymentStatus });

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // Handle successful payment
    if (paymentStatus === 'paid') {
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

            console.log('Subscription created for user:', payment.user_id);
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
              .upsert({
                user_id: booking.user_id,
                professional_id: booking.professional_id,
                booking_id,
              }, {
                onConflict: 'user_id,professional_id',
              });

            console.log('Booking updated and chat channel created:', booking_id);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
