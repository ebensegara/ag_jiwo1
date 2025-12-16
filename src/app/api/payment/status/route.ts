import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ref_code = searchParams.get('ref_code');

    if (!ref_code) {
      return NextResponse.json(
        { error: 'Missing ref_code parameter' },
        { status: 400 }
      );
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, status, amount, payment_type, ref_code, created_at')
      .eq('ref_code', ref_code)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
