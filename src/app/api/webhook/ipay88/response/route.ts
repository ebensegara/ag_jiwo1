import { NextRequest, NextResponse } from "next/server";

// Response URL handler - redirects user after payment
export async function POST(request: NextRequest) {
    try {
        // Parse response data
        let responseData: Record<string, string> = {};
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            responseData = await request.json();
        } else {
            const formData = await request.formData();
            formData.forEach((value, key) => {
                responseData[key] = value.toString();
            });
        }

        console.log("=== iPay88 Response URL Hit ===");
        console.log("Response Data:", JSON.stringify(responseData, null, 2));

        const { RefNo, TransactionStatus, ErrDesc } = responseData;
        const isSuccess = TransactionStatus === "1";

        // Get base URL for redirect
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        // Redirect to appropriate page based on payment status
        if (isSuccess) {
            return NextResponse.redirect(
                `${baseUrl}/plans?status=success&ref=${RefNo}`,
                { status: 303 }
            );
        } else {
            return NextResponse.redirect(
                `${baseUrl}/plans?status=failed&ref=${RefNo}&error=${encodeURIComponent(ErrDesc || "Payment failed")}`,
                { status: 303 }
            );
        }
    } catch (error) {
        console.error("Response URL error:", error);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        return NextResponse.redirect(`${baseUrl}/plans?status=error`, {
            status: 303,
        });
    }
}

// Also handle GET requests (some payment gateways use GET for redirects)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("TransactionStatus");
    const refNo = searchParams.get("RefNo");
    const errDesc = searchParams.get("ErrDesc");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const isSuccess = status === "1";

    if (isSuccess) {
        return NextResponse.redirect(`${baseUrl}/plans?status=success&ref=${refNo}`, {
            status: 303,
        });
    } else {
        return NextResponse.redirect(
            `${baseUrl}/plans?status=failed&ref=${refNo}&error=${encodeURIComponent(errDesc || "Payment failed")}`,
            { status: 303 }
        );
    }
}
