"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    qris_link?: string;
    qris_string?: string;
    ref_code: string;
    payment_id?: string;
    amount: number;
    expiry_time?: string;
  };
  onSuccess: () => void;
  type: "subscription" | "booking";
}

export default function QrisModal({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
  type,
}: QrisModalProps) {
  const [status, setStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Debug: Log paymentData
  console.log('QrisModal: paymentData received:', paymentData);

  useEffect(() => {
    if (!isOpen || !paymentData) return;

    // Calculate expiry countdown
    if (paymentData.expiry_time) {
      const expiryDate = new Date(paymentData.expiry_time);
      const updateCountdown = () => {
        const now = new Date();
        const diff = expiryDate.getTime() - now.getTime();
        if (diff > 0) {
          setTimeLeft(Math.floor(diff / 1000));
        } else {
          setTimeLeft(0);
          setStatus("failed");
        }
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, paymentData]);

  useEffect(() => {
    if (!isOpen || !paymentData) return;

    console.log('QrisModal: Setting up realtime subscription for payment:', paymentData.payment_id);

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`payment:${paymentData.payment_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "payments",
          filter: `id=eq.${paymentData.payment_id}`,
        },
        (payload: any) => {
          console.log('QrisModal: Realtime update received:', payload);
          const newStatus = payload.new.status;
          setStatus(newStatus);
          if (newStatus === "paid") {
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 1500);
          }
        }
      )
      .subscribe();

    // Poll every 3 seconds for faster response
    const pollInterval = setInterval(async () => {
      try {
        console.log('QrisModal: Polling payment status for ref_code:', paymentData.ref_code);
        const response = await fetch(
          `/api/payment/status?ref_code=${paymentData.ref_code}`
        );
        const data = await response.json();
        console.log('QrisModal: Poll response:', data);
        if (data.success && data.payment) {
          const newStatus = data.payment.status;
          if (newStatus !== status) {
            console.log('QrisModal: Status changed:', status, '->', newStatus);
            setStatus(newStatus);
          }
          if (newStatus === "paid") {
            clearInterval(pollInterval);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 3000);

    return () => {
      console.log('QrisModal: Cleaning up subscriptions');
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [isOpen, paymentData, onSuccess, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
              DUMMY MODE - Auto-confirms in 5-10s
            </span>
          </div>
          <DialogTitle className="text-center">
            {status === "pending" && "Scan QRIS Code"}
            {status === "paid" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            {status === "pending" && "Use your e-wallet app to scan the QR code"}
            {status === "paid" && "Your payment has been confirmed"}
            {status === "failed" && "Payment was not completed"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {status === "pending" && (
            <>
              {(paymentData.qris_string || paymentData.qris_link) ? (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img
                    src={paymentData.qris_link || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentData.qris_string || '')}`}
                    alt="QRIS Code"
                    className="w-64 h-64"
                    onError={(e) => {
                      console.error('Failed to load QR image');
                    }}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg w-64 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Generating QR code...</p>
                  </div>
                </div>
              )}

              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  Rp {paymentData.amount.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-600">
                  Scan QR code with your e-wallet app
                </p>
                {timeLeft !== null && timeLeft > 0 && (
                  <p className="text-sm font-medium text-orange-600">
                    Expires in: {formatTime(timeLeft)}
                  </p>
                )}
              </div>

              {paymentData.qris_link && paymentData.qris_link.includes('midtrans.com') && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(paymentData.qris_link, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Payment Page
                </Button>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for payment...
              </div>
            </>
          )}

          {status === "paid" && (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
              <div>
                <p className="text-xl font-bold text-gray-900">Payment Confirmed!</p>
                <p className="text-sm text-gray-600 mt-2">
                  {type === "subscription"
                    ? "Your subscription has been activated"
                    : "Your booking has been confirmed"}
                </p>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center space-y-4">
              <XCircle className="h-20 w-20 text-red-500 mx-auto" />
              <div>
                <p className="text-xl font-bold text-gray-900">Payment Failed</p>
                <p className="text-sm text-gray-600 mt-2">
                  {timeLeft === 0
                    ? "Payment has expired. Please try again."
                    : "Payment was not successful. Please try again."}
                </p>
              </div>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>

        {status === "pending" && (
          <div className="text-center">
            <Button variant="ghost" onClick={onClose} className="text-sm">
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
