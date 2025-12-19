"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Ipay88QrisModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentData: {
        checkout_url: string;
        checkout_id: string;
        checkout_signature?: string;
        ref_code: string;
        payment_id: string;
        amount: number;
        expiry_time?: string;
    };
    onSuccess: () => void;
    type: "subscription" | "booking";
}

export default function Ipay88QrisModal({
    isOpen,
    onClose,
    paymentData,
    onSuccess,
    type,
}: Ipay88QrisModalProps) {
    const [status, setStatus] = useState<"pending" | "paid" | "failed">("pending");
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [hasOpened, setHasOpened] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Debug: Log paymentData
    console.log("Ipay88QrisModal: paymentData received:", paymentData);

    // Auto-submit form to open iPay88 payment page
    useEffect(() => {
        if (isOpen && paymentData && !hasOpened && formRef.current) {
            console.log("Ipay88QrisModal: Auto-submitting form to iPay88");
            setHasOpened(true);
            // Submit form to open iPay88 in new tab
            formRef.current.submit();
        }
    }, [isOpen, paymentData, hasOpened]);

    // Countdown timer
    useEffect(() => {
        if (!isOpen || !paymentData) return;

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

    // Poll payment status
    useEffect(() => {
        if (!isOpen || !paymentData) return;

        console.log(
            "Ipay88QrisModal: Setting up polling for payment:",
            paymentData.payment_id
        );

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
                    console.log("Ipay88QrisModal: Realtime update received:", payload);
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

        // Poll every 3 seconds
        const pollInterval = setInterval(async () => {
            try {
                console.log(
                    "Ipay88QrisModal: Polling payment status for ref_code:",
                    paymentData.ref_code
                );
                const response = await fetch(
                    `/api/payment/status?ref_code=${paymentData.ref_code}`
                );
                const data = await response.json();
                console.log("Ipay88QrisModal: Poll response:", data);
                if (data.success && data.payment) {
                    const newStatus = data.payment.status;
                    if (newStatus !== status) {
                        console.log(
                            "Ipay88QrisModal: Status changed:",
                            status,
                            "->",
                            newStatus
                        );
                        setStatus(newStatus);
                    }
                    if (newStatus === "paid") {
                        clearInterval(pollInterval);
                        setTimeout(() => {
                            onSuccess();
                            onClose();
                        }, 1500);
                    } else if (newStatus === "failed") {
                        clearInterval(pollInterval);
                    }
                }
            } catch (error) {
                console.error("Error polling payment status:", error);
            }
        }, 3000);

        return () => {
            console.log("Ipay88QrisModal: Cleaning up subscriptions");
            channel.unsubscribe();
            clearInterval(pollInterval);
        };
    }, [isOpen, paymentData, onSuccess, onClose, status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleOpenPayment = () => {
        if (formRef.current) {
            formRef.current.submit();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {status === "pending" && "Complete Payment"}
                        {status === "paid" && "Payment Successful!"}
                        {status === "failed" && "Payment Failed"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-gray-600">
                        {status === "pending" &&
                            "Complete your payment in the iPay88 window"}
                        {status === "paid" && "Your payment has been confirmed"}
                        {status === "failed" && "Payment was not completed"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    {status === "pending" && (
                        <>
                            <div className="bg-[#756657]/10 p-6 rounded-lg text-center">
                                <p className="text-3xl font-bold text-[#756657]">
                                    Rp {paymentData.amount.toLocaleString("id-ID")}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Ref: {paymentData.ref_code}
                                </p>
                            </div>

                            {timeLeft !== null && timeLeft > 0 && (
                                <p className="text-sm font-medium text-orange-600">
                                    Expires in: {formatTime(timeLeft)}
                                </p>
                            )}

                            <div className="space-y-3 w-full">
                                <Button
                                    onClick={handleOpenPayment}
                                    className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Payment Page
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Waiting for payment confirmation...
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 text-center">
                                A payment window has been opened. Complete your payment there
                                and this page will update automatically.
                            </p>
                        </>
                    )}

                    {status === "paid" && (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
                            <div>
                                <p className="text-xl font-bold text-gray-900">
                                    Payment Confirmed!
                                </p>
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

                {/* Hidden form for iPay88 redirect */}
                <form
                    ref={formRef}
                    action={paymentData.checkout_url}
                    method="POST"
                    target="_blank"
                    style={{ display: "none" }}
                >
                    <input
                        type="hidden"
                        name="CheckoutID"
                        value={paymentData.checkout_id}
                    />
                    {paymentData.checkout_signature && (
                        <input
                            type="hidden"
                            name="Signature"
                            value={paymentData.checkout_signature}
                        />
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
