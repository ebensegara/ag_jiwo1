import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref_code = searchParams.get('ref');
  const user_id = searchParams.get('user_id');
  const payment_type = searchParams.get('type');

  if (!ref_code || !user_id) {
    return NextResponse.redirect(new URL('/plans?status=error', request.url));
  }

  try {
    // Update payment status to paid
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: 'paid' })
      .eq('ref_code', ref_code);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
    }

    // If subscription, create subscription record
    if (payment_type === 'subscription') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await supabase.from('subscriptions').upsert({
        user_id,
        plan_type: 'premium',
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_ref: ref_code,
      }, {
        onConflict: 'user_id',
      });
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/plans?status=finish&mock=true', request.url));
  } catch (error) {
    console.error('Mock payment error:', error);
    return NextResponse.redirect(new URL('/plans?status=error', request.url));
  }
}
