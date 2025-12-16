import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, amount, payment_type, metadata } = body;

    // Check if MIDTRANS_SERVER_KEY is set and trim any whitespace
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY?.trim();
    if (!midtransServerKey) {
      console.error('MIDTRANS_SERVER_KEY is not set');
      return NextResponse.json(
        { error: 'Payment service not configured. Please contact support.' },
        { status: 500 }
      );
    }
    
    // Validate key format
    if (!midtransServerKey.startsWith('SB-Mid-server-') && !midtransServerKey.startsWith('Mid-server-')) {
      console.error('Invalid MIDTRANS_SERVER_KEY format. Key should start with SB-Mid-server- (sandbox) or Mid-server- (production)');
      return NextResponse.json(
        { error: 'Payment service misconfigured. Please contact support.' },
        { status: 500 }
      );
    }

    if (!user_id || !amount || !payment_type) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, amount, payment_type' },
        { status: 400 }
      );
    }

    // Get user data from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate unique order_id (ref_code)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ref_code = `RUANG-${payment_type.toUpperCase()}-${timestamp}-${randomStr}`;

    // Prepare Midtrans Snap payload
    const snapPayload = {
      transaction_details: {
        order_id: ref_code,
        gross_amount: Math.round(amount),
      },
      customer_details: {
        first_name: user.full_name || 'User',
        email: user.email || 'user@example.com',
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ruangpulih.com'}/plans?status=finish`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ruangpulih.com'}/plans?status=error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ruangpulih.com'}/plans?status=pending`,
      },
    };

    // Call Midtrans Snap API
    const authString = Buffer.from(`${midtransServerKey}:`).toString('base64');
    
    console.log('Calling Midtrans Snap API with order_id:', ref_code);
    
    const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(snapPayload),
    });

    const midtransResult = await midtransResponse.json();

    // If Midtrans fails, use mock payment for testing
    let snap_token: string;
    let redirect_url: string;
    let useMockPayment = false;

    if (!midtransResponse.ok) {
      console.error('Midtrans error:', midtransResult);
      console.warn('Falling back to mock payment mode for testing');
      
      // Generate mock token for testing
      snap_token = `MOCK-${ref_code}`;
      redirect_url = `/api/payment/mock-complete?ref=${ref_code}&user_id=${user_id}&type=${payment_type}`;
      useMockPayment = true;
    } else {
      snap_token = midtransResult.token;
      redirect_url = midtransResult.redirect_url;
    }

    // Save payment record to Supabase
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id,
        amount: Math.round(amount),
        payment_type,
        status: 'pending',
        ref_code,
        snap_token,
        metadata: {
          ...metadata,
          redirect_url,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error saving payment:', paymentError);
      return NextResponse.json(
        { error: 'Failed to save payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      snap_token,
      redirect_url,
      ref_code,
      payment_id: payment.id,
      mock_payment: useMockPayment,
    });
  } catch (error) {
    console.error('Error in charge endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
