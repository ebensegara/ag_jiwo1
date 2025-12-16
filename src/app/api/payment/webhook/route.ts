import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const midtransServerKey = process.env.MIDTRANS_SERVER_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${midtransServerKey}`)
    .digest('hex');
  return hash === signatureKey;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature
    if (signature_key && !verifySignature(order_id, status_code, gross_amount, signature_key)) {
      console.error('Invalid signature for order:', order_id);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const ref_code = order_id || body.ref_code;

    if (!ref_code) {
      return NextResponse.json(
        { error: 'Missing ref_code or order_id' },
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

    // Update payment status
    let paymentStatus = 'pending';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (!fraud_status || fraud_status === 'accept') {
        paymentStatus = 'paid';
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      paymentStatus = 'failed';
    } else if (body.status === 'paid') {
      paymentStatus = 'paid';
    }
    
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: paymentStatus,
        midtrans_response: body,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // Process based on payment type
    if (paymentStatus === 'paid') {
      if (payment.payment_type === 'subscription') {
        await processSubscriptionPayment(payment);
      } else if (payment.payment_type === 'booking') {
        await processBookingPayment(payment);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Error in webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processSubscriptionPayment(payment: any) {
  const metadata = payment.metadata || {};
  const plan_id = metadata.plan_id;

  if (!plan_id) {
    console.error('Missing plan_id in payment metadata');
    return;
  }

  // Get plan details to get duration_days
  const { data: plan } = await supabase
    .from('plans')
    .select('duration_days')
    .eq('id', plan_id)
    .single();

  const duration_days = plan?.duration_days || 30;

  const start_date = new Date();
  const end_date = new Date();
  end_date.setDate(end_date.getDate() + duration_days);

  // Create or update subscription
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: payment.user_id,
      plan_id,
      status: 'active',
      start_date: start_date.toISOString(),
      end_date: end_date.toISOString(),
    });

  if (error) {
    console.error('Error creating subscription:', error);
    return;
  }

  // Update chat_usage to set is_premium = true
  const { error: chatUsageError } = await supabase
    .from('chat_usage')
    .upsert(
      {
        user_id: payment.user_id,
        is_premium: true,
        chat_limit: 999999,
        updated_at: new Date().toISOString(),
      },
      { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      }
    );

  if (chatUsageError) {
    console.error('Error updating chat_usage:', chatUsageError);
  } else {
    console.log('Successfully updated is_premium for user:', payment.user_id);
  }
}

async function processBookingPayment(payment: any) {
  const metadata = payment.metadata || {};
  const session_id = metadata.session_id;
  const professional_id = metadata.professional_id;

  if (!session_id) {
    console.error('Missing session_id in payment metadata');
    return;
  }

  // Update session status
  const { error: sessionError } = await supabase
    .from('sessions')
    .update({
      status: 'paid',
    })
    .eq('id', session_id);

  if (sessionError) {
    console.error('Error updating session:', sessionError);
    return;
  }

  // Get session details
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, professional_id')
    .eq('id', session_id)
    .single();

  if (session) {
    // Check if chat channel already exists
    const { data: existingChannel } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('user_id', session.user_id)
      .eq('professional_id', session.professional_id)
      .single();

    if (existingChannel) {
      // Update existing channel with booking_id
      const { error: updateError } = await supabase
        .from('chat_channels')
        .update({ booking_id: session_id })
        .eq('id', existingChannel.id);

      if (updateError) {
        console.error('Error updating chat channel:', updateError);
      }
    } else {
      // Create new chat channel
      const { error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          user_id: session.user_id,
          professional_id: session.professional_id,
          booking_id: session_id,
        });

      if (channelError) {
        console.error('Error creating chat channel:', channelError);
      }
    }
  }
}