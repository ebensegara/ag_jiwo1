import { NextRequest, NextResponse } from "next/server";

// NOTE: This QRIS endpoint is deprecated. 
// Use /api/payment/charge for Midtrans Snap payments instead.
// This endpoint now redirects to the charge endpoint for backward compatibility.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to the new charge endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const chargeResponse = await fetch(`${baseUrl}/api/payment/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await chargeResponse.json();
    
    return NextResponse.json(result, { status: chargeResponse.status });
  } catch (error) {
    console.error("QRIS redirect error:", error);
    return NextResponse.json(
      { error: "Please use /api/payment/charge endpoint instead" },
      { status: 500 }
    );
  }
}
