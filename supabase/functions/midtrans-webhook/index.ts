import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
  serverKey: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${orderId}${statusCode}${grossAmount}${serverKey}`);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === signatureKey;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature
    const isValid = await verifySignature(
      order_id,
      status_code,
      gross_amount,
      signature_key,
      midtransServerKey
    );

    if (!isValid) {
      console.error('Invalid signature for order:', order_id);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine payment status
    let newStatus = 'pending';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'paid';
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newStatus = 'failed';
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        midtrans_response: body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle successful payment
    if (newStatus === 'paid') {
      if (payment.payment_type === 'subscription') {
        await handleSubscriptionPayment(supabase, payment);
      } else if (payment.payment_type === 'booking') {
        await handleBookingPayment(supabase, payment);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSubscriptionPayment(supabase: any, payment: any) {
  try {
    const { plan_id } = payment.metadata || {};
    if (!plan_id) {
      console.error('No plan_id in payment metadata');
      return;
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      console.error('Plan not found:', plan_id);
      return;
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', payment.user_id)
      .eq('payment_ref', payment.ref_code)
      .single();

    if (existingSub) {
      // Update existing subscription
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .eq('id', existingSub.id);
    } else {
      // Create new subscription
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

    console.log('Subscription activated for user:', payment.user_id);
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

async function handleBookingPayment(supabase: any, payment: any) {
  try {
    const { booking_id } = payment.metadata || {};
    if (!booking_id) {
      console.error('No booking_id in payment metadata');
      return;
    }

    // Update booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'paid',
        payment_ref: payment.ref_code,
      })
      .eq('id', booking_id);

    if (bookingError) {
      console.error('Failed to update booking:', bookingError);
      return;
    }

    // Get booking details
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id, professional_id')
      .eq('id', booking_id)
      .single();

    if (!booking) {
      console.error('Booking not found:', booking_id);
      return;
    }

    // Check if chat channel already exists
    const { data: existingChannel } = await supabase
      .from('chat_channels')
      .select('*')
      .eq('user_id', booking.user_id)
      .eq('professional_id', booking.professional_id)
      .eq('booking_id', booking_id)
      .single();

    if (!existingChannel) {
      // Create chat channel
      await supabase
        .from('chat_channels')
        .insert({
          user_id: booking.user_id,
          professional_id: booking.professional_id,
          booking_id,
        });
    }

    console.log('Booking paid and chat channel created for booking:', booking_id);
  } catch (error) {
    console.error('Error handling booking payment:', error);
  }
}
