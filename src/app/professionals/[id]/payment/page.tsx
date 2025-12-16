"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { QRCodeSVG } from "qrcode.react";

interface Session {
  id: string;
  schedule_time: string;
  price: number;
  professional_id: string;
  professionals: {
    full_name: string;
  };
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [payment, setPayment] = useState<any>(null);
  const [status, setStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!payment || !polling) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("status")
          .eq("ref_code", payment.ref_code)
          .single();

        if (error) throw error;

        if (data.status === "paid") {
          setStatus("paid");
          setPolling(false);
          setTimeout(() => {
            router.replace(`/professionals/${params.id}/success?session_id=${session?.id}`);
          }, 2000);
        } else if (data.status === "failed") {
          setStatus("failed");
          setPolling(false);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [payment, polling, session, params.id, router]);

  const fetchSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          professionals (
            full_name
          )
        `)
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      setSession(data);
      await createPayment(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load session",
        variant: "destructive",
      });
    }
  };

  const createPayment = async (sessionData: Session) => {
    try {
      const user = await getSafeUser();
      if (!user) return;

      const refCode = `SESSION-${sessionData.id.substring(0, 8)}-${Date.now()}`;
      const qrisLink = `https://api.qris.id/v1/qr?amount=${sessionData.price}&ref=${refCode}`;

      const { data: paymentData, error } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: sessionData.price,
          payment_type: "booking",
          status: "pending",
          qris_link: qrisLink,
          ref_code: refCode,
          metadata: {
            session_id: sessionData.id,
            professional_id: sessionData.professional_id,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Update session with payment ref
      await supabase
        .from("sessions")
        .update({ payment_ref: refCode })
        .eq("id", sessionData.id);

      setPayment(paymentData);
      setPolling(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    }
  };

  const handleSimulatePayment = async () => {
    if (!payment) return;

    try {
      const response = await fetch("/api/payment/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref_code: payment.ref_code,
          status: "paid",
          transaction_status: "settlement",
        }),
      });

      if (response.ok) {
        setStatus("paid");
        setPolling(false);
        setTimeout(() => {
          router.replace(`/professionals/${params.id}/success?session_id=${session?.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error simulating payment:", error);
    }
  };

  if (!session || !payment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#756657]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2"
          disabled={status === "paid"}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {status === "pending" && "Complete Payment"}
              {status === "paid" && "Payment Successful!"}
              {status === "failed" && "Payment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Summary */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Professional</span>
                <span className="font-semibold">{session.professionals.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="font-semibold">
                  {new Date(session.schedule_time).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-[#756657]">
                  Rp {session.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex flex-col items-center gap-4">
              {status === "pending" && (
                <>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <QRCodeSVG value={payment.qris_link} size={240} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ref: {payment.ref_code}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for payment confirmation...
                  </div>
                  
                  {/* Demo button */}
                  <Button
                    onClick={handleSimulatePayment}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Simulate Payment (Demo)
                  </Button>
                </>
              )}

              {status === "paid" && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                  <p className="text-xl font-semibold">Payment Confirmed!</p>
                  <p className="text-sm text-muted-foreground">Redirecting...</p>
                </div>
              )}

              {status === "failed" && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <XCircle className="h-20 w-20 text-red-500" />
                  <p className="text-xl font-semibold">Payment Failed</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}