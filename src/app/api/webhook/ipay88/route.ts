import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase configuration missing");
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

// Validate callback signature from iPay88
function validateSignature(
    merchantKey: string,
    merchantCode: string,
    paymentId: string,
    refNo: string,
    amount: string,
    currency: string,
    transactionStatus: string,
    receivedSignature: string
): boolean {
    const signatureString = `||${merchantKey}||${merchantCode}||${paymentId}||${refNo}||${amount}||${currency}||${transactionStatus}||`;
    const calculatedSignature = createHash("sha256")
        .update(signatureString)
        .digest("hex");

    console.log("Signature validation:");
    console.log("- String:", signatureString.replace(merchantKey, "***"));
    console.log("- Calculated:", calculatedSignature);
    console.log("- Received:", receivedSignature);

    return calculatedSignature.toLowerCase() === receivedSignature.toLowerCase();
}

// Backend callback handler (BackendPost from iPay88)
export async function POST(request: NextRequest) {
    const supabase = getSupabaseClient();

    try {
        const merchantKey = process.env.IPAY88_MERCHANT_KEY;
        const merchantCode = process.env.IPAY88_MERCHANT_CODE;

        if (!merchantKey || !merchantCode) {
            console.error("Missing iPay88 configuration");
            return NextResponse.json(
                {
                    Code: "0",
                    Message: {
                        English: "Configuration error",
                        Indonesian: "Kesalahan konfigurasi",
                    },
                },
                { status: 500 }
            );
        }

        // Parse callback data
        let callbackData: Record<string, string> = {};
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            callbackData = await request.json();
        } else {
            // Handle form data (iPay88 usually sends form data)
            const formData = await request.formData();
            formData.forEach((value, key) => {
                callbackData[key] = value.toString();
            });
        }

        console.log("===========================================");
        console.log("=== iPay88 CALLBACK RECEIVED ===");
        console.log("Timestamp:", new Date().toISOString());
        console.log("Callback Data:", JSON.stringify(callbackData, null, 2));
        console.log("===========================================");

        // Extract fields from callback
        const {
            MerchantCode: cbMerchantCode,
            PaymentId,
            RefNo,
            Amount,
            Currency,
            TransactionStatus,
            Signature,
            TransId,
            AuthCode,
            ErrDesc,
            PaymentDate,
        } = callbackData;

        // Validate signature
        const isValidSignature = validateSignature(
            merchantKey,
            cbMerchantCode || merchantCode,
            PaymentId || "",
            RefNo || "",
            Amount || "",
            Currency || "",
            TransactionStatus || "",
            Signature || ""
        );

        console.log("Signature Valid:", isValidSignature);

        if (!isValidSignature) {
            console.error("Invalid signature for RefNo:", RefNo);
            // Still return success to iPay88 to acknowledge receipt
            // but log the error
        }

        // Get payment record from database
        const { data: payment, error: paymentError } = await supabase
            .from("payments")
            .select("*")
            .eq("ref_code", RefNo)
            .single();

        if (paymentError || !payment) {
            console.error("Payment not found for RefNo:", RefNo);
            return NextResponse.json(
                {
                    Code: "1",
                    Message: {
                        English: "Payment not found but acknowledged",
                        Indonesian: "Pembayaran tidak ditemukan tapi diterima",
                    },
                }
            );
        }

        // Determine payment status
        const isSuccess = TransactionStatus === "1";
        const paymentStatus = isSuccess ? "paid" : "failed";
        const statusText = isSuccess ? "SUCCESS" : "FAILED";

        console.log("===========================================");
        console.log("=== PAYMENT STATUS: " + statusText + " ===");
        console.log("RefNo:", RefNo);
        console.log("TransId:", TransId);
        console.log("Amount:", Amount, Currency);
        console.log("PaymentId:", PaymentId);
        console.log("AuthCode:", AuthCode);
        console.log("PaymentDate:", PaymentDate);
        console.log("Error Description:", ErrDesc || "None");
        console.log("===========================================");

        // Update payment status in database
        const { error: updateError } = await supabase
            .from("payments")
            .update({
                status: paymentStatus,
                updated_at: new Date().toISOString(),
                metadata: {
                    ...payment.metadata,
                    ipay88_callback: callbackData,
                    trans_id: TransId,
                    auth_code: AuthCode,
                    payment_date: PaymentDate,
                    error_desc: ErrDesc,
                },
            })
            .eq("id", payment.id);

        if (updateError) {
            console.error("Error updating payment:", updateError);
        }

        // Process successful payment
        if (paymentStatus === "paid") {
            if (payment.payment_type === "subscription") {
                await processSubscriptionPayment(supabase, payment);
            } else if (payment.payment_type === "booking") {
                await processBookingPayment(supabase, payment);
            }
        }

        // Return response to iPay88
        return NextResponse.json({
            Code: "1",
            Message: {
                English: "Status Received",
                Indonesian: "Status diterima",
            },
        });
    } catch (error) {
        console.error("Callback processing error:", error);
        return NextResponse.json(
            {
                Code: "0",
                Message: {
                    English: "Processing error",
                    Indonesian: "Kesalahan pemrosesan",
                },
            },
            { status: 500 }
        );
    }
}

// Process subscription payment
async function processSubscriptionPayment(supabase: any, payment: any) {
    const metadata = payment.metadata || {};
    const plan_id = metadata.plan_id;

    if (!plan_id) {
        console.error("Missing plan_id in payment metadata");
        return;
    }

    // Get plan details
    const { data: plan } = await supabase
        .from("plans")
        .select("duration_days")
        .eq("id", plan_id)
        .single();

    const duration_days = plan?.duration_days || 30;

    const start_date = new Date();
    const end_date = new Date();
    end_date.setDate(end_date.getDate() + duration_days);

    // Create subscription
    const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: payment.user_id,
        plan_id,
        status: "active",
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        payment_ref: payment.ref_code,
    });

    if (subError) {
        console.error("Error creating subscription:", subError);
        return;
    }

    console.log("Subscription created for user:", payment.user_id);

    // Update chat_usage to set is_premium = true
    const { error: chatUsageError } = await supabase.from("chat_usage").upsert(
        {
            user_id: payment.user_id,
            is_premium: true,
            chat_limit: 999999,
            updated_at: new Date().toISOString(),
        },
        {
            onConflict: "user_id",
            ignoreDuplicates: false,
        }
    );

    if (chatUsageError) {
        console.error("Error updating chat_usage:", chatUsageError);
    } else {
        console.log("Successfully updated is_premium for user:", payment.user_id);
    }
}

// Process booking payment
async function processBookingPayment(supabase: any, payment: any) {
    const metadata = payment.metadata || {};
    const session_id = metadata.session_id || metadata.booking_id;

    if (!session_id) {
        console.error("Missing session_id in payment metadata");
        return;
    }

    // Update session status
    const { error: sessionError } = await supabase
        .from("sessions")
        .update({
            status: "paid",
            payment_ref: payment.ref_code,
        })
        .eq("id", session_id);

    if (sessionError) {
        console.error("Error updating session:", sessionError);
    }

    // Also update bookings table if exists
    await supabase
        .from("bookings")
        .update({
            status: "paid",
            payment_ref: payment.ref_code,
        })
        .eq("id", session_id);

    // Get session details for chat channel
    const { data: session } = await supabase
        .from("sessions")
        .select("user_id, professional_id")
        .eq("id", session_id)
        .single();

    if (session) {
        // Check if chat channel already exists
        const { data: existingChannel } = await supabase
            .from("chat_channels")
            .select("id")
            .eq("user_id", session.user_id)
            .eq("professional_id", session.professional_id)
            .single();

        if (existingChannel) {
            await supabase
                .from("chat_channels")
                .update({ booking_id: session_id })
                .eq("id", existingChannel.id);
        } else {
            await supabase.from("chat_channels").insert({
                user_id: session.user_id,
                professional_id: session.professional_id,
                booking_id: session_id,
            });
        }

        console.log("Booking processed and chat channel created:", session_id);
    }
}
