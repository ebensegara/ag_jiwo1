import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Constants
const PAYMENT_ID = "78"; // QRIS Payment ID for iPay88
const CURRENCY = "IDR";

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase configuration missing");
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

// Generate SHA256 signature for iPay88
function generateSignature(
    merchantKey: string,
    merchantCode: string,
    refNo: string,
    amount: string,
    currency: string
): string {
    const signatureString = `||${merchantKey}||${merchantCode}||${refNo}||${amount}||${currency}||`;
    return createHash("sha256").update(signatureString).digest("hex");
}

// Generate unique reference number
function generateRefNo(paymentType: string): string {
    const now = new Date();
    const timestamp = now.getTime();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = paymentType === "subscription" ? "SUB" : "BKG";
    return `JIWO-${prefix}-${timestamp}-${randomStr}`;
}

export async function POST(request: NextRequest) {
    const supabase = getSupabaseClient();

    try {
        const body = await request.json();
        const { user_id, amount, payment_type, metadata } = body;

        // Validate required fields
        if (!user_id || !amount || !payment_type) {
            return NextResponse.json(
                { error: "Missing required fields: user_id, amount, payment_type" },
                { status: 400 }
            );
        }

        // Get environment variables
        const merchantCode = process.env.IPAY88_MERCHANT_CODE;
        const merchantKey = process.env.IPAY88_MERCHANT_KEY;
        const apiUrl = process.env.IPAY88_API_URL;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        if (!merchantCode || !merchantKey || !apiUrl) {
            console.error("iPay88 configuration missing");
            return NextResponse.json(
                { error: "Payment service not configured. Please contact support." },
                { status: 500 }
            );
        }

        // Get user data from Supabase - try users table first, then fallback to auth
        let userData = {
            full_name: "User",
            email: "user@example.com",
            phone: "081234567890"
        };

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email, full_name, phone")
            .eq("id", user_id)
            .single();

        if (user) {
            userData = {
                full_name: user.full_name || "User",
                email: user.email || "user@example.com",
                phone: user.phone || "081234567890"
            };
        } else {
            // Try to get from auth.users via admin API
            console.log("User not in users table, trying auth...");
            const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
            if (authUser?.user) {
                userData = {
                    full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || "User",
                    email: authUser.user.email || "user@example.com",
                    phone: authUser.user.user_metadata?.phone || "081234567890"
                };
            }
        }

        // Generate unique reference number
        const refNo = generateRefNo(payment_type);
        const amountStr = Math.round(amount).toString();

        // Generate signature
        const signature = generateSignature(
            merchantKey,
            merchantCode,
            refNo,
            amountStr,
            CURRENCY
        );

        // Prepare product description
        let prodDesc = "Jiwo.AI Payment";
        if (payment_type === "subscription" && metadata?.plan_name) {
            prodDesc = `Subscription: ${metadata.plan_name}`;
        } else if (payment_type === "booking" && metadata?.professional_name) {
            prodDesc = `Booking with ${metadata.professional_name}`;
        }

        // Prepare request payload for iPay88
        const payload = {
            APIVersion: "2.0",
            MerchantCode: merchantCode,
            PaymentId: PAYMENT_ID,
            Currency: CURRENCY,
            RefNo: refNo,
            Amount: amountStr,
            ProdDesc: prodDesc,
            UserName: userData.full_name,
            UserEmail: userData.email,
            UserContact: userData.phone,
            Remark: JSON.stringify({ payment_type, ...metadata }),
            Lang: "UTF-8",
            RequestType: "REDIRECT",
            ResponseURL: `${baseUrl}/api/webhook/ipay88/response`,
            BackendURL: `${baseUrl}/api/webhook/ipay88`,
            Signature: signature,
        };

        console.log("=== iPay88 Payment Request ===");
        console.log("RefNo:", refNo);
        console.log("Amount:", amountStr);
        console.log("User:", userData.email);
        console.log("PaymentType:", payment_type);

        // Call iPay88 API
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        console.log("iPay88 Raw Response:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            console.error("Invalid response from iPay88:", responseText);
            return NextResponse.json(
                { error: "Invalid response from payment service", raw: responseText },
                { status: 500 }
            );
        }

        console.log("iPay88 Response:", JSON.stringify(data, null, 2));

        // Check if checkout was successful
        if (data.Code === "1" && data.CheckoutID) {
            // Save payment record to Supabase
            const { data: payment, error: paymentError } = await supabase
                .from("payments")
                .insert({
                    user_id,
                    amount: Math.round(amount),
                    payment_type,
                    status: "pending",
                    ref_code: refNo,
                    qris_string: data.CheckoutID, // Store CheckoutID for reference
                    metadata: {
                        ...metadata,
                        checkout_id: data.CheckoutID,
                        ipay88_response: data,
                    },
                })
                .select()
                .single();

            if (paymentError) {
                console.error("Error saving payment:", paymentError);
                return NextResponse.json(
                    { error: "Failed to save payment record" },
                    { status: 500 }
                );
            }

            // Return redirect URL and payload for form POST
            const checkoutUrl = "https://sandbox.ipay88.co.id/ePayment/entry.asp";

            return NextResponse.json({
                success: true,
                checkout_url: checkoutUrl,
                checkout_id: data.CheckoutID,
                checkout_signature: data.Signature,
                ref_code: refNo,
                payment_id: payment.id,
                amount: Math.round(amount),
                message: data.Message,
                // For QrisModal compatibility
                qris_string: data.CheckoutID,
                expiry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
            });
        } else {
            console.error("iPay88 Error:", data);
            return NextResponse.json(
                {
                    error: data.Message || "Failed to create payment",
                    code: data.Code,
                    details: data,
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Payment creation error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        );
    }
}
