"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: SnapResult) => void;
          onPending?: (result: SnapResult) => void;
          onError?: (result: SnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
      embed: (
        token: string,
        options: {
          embedId: string;
          onSuccess?: (result: SnapResult) => void;
          onPending?: (result: SnapResult) => void;
          onError?: (result: SnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface SnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
}

interface PayWithSnapProps {
  snapToken: string;
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
  autoOpen?: boolean;
  buttonText?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

const MIDTRANS_SNAP_JS = "https://app.sandbox.midtrans.com/snap/snap.js";

export default function PayWithSnap({
  snapToken,
  onSuccess,
  onPending,
  onError,
  onClose,
  autoOpen = false,
  buttonText = "Bayar Sekarang",
  buttonClassName = "",
  disabled = false,
}: PayWithSnapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSnapReady, setIsSnapReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Snap.js script
  useEffect(() => {
    // Get client key from env
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    console.log("PayWithSnap: Loading Snap.js with client key:", clientKey ? "present" : "missing");
    
    const existingScript = document.getElementById("midtrans-snap-script");
    
    if (existingScript) {
      if (window.snap) {
        console.log("PayWithSnap: Snap already loaded");
        setIsSnapReady(true);
        setIsLoading(false);
      } else {
        existingScript.addEventListener("load", () => {
          console.log("PayWithSnap: Snap loaded from existing script");
          setIsSnapReady(true);
          setIsLoading(false);
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap-script";
    script.src = MIDTRANS_SNAP_JS;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    script.onload = () => {
      console.log("PayWithSnap: Snap.js loaded successfully");
      setIsSnapReady(true);
      setIsLoading(false);
    };

    script.onerror = (e) => {
      console.error("PayWithSnap: Failed to load Midtrans Snap script", e);
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount to allow reuse
    };
  }, []);

  const handlePayment = useCallback(() => {
    console.log("PayWithSnap: handlePayment called, snapToken:", snapToken ? "present" : "missing", "window.snap:", !!window.snap);
    
    if (!window.snap || !snapToken) {
      console.error("PayWithSnap: Snap not ready or token missing");
      return;
    }

    setIsProcessing(true);
    console.log("PayWithSnap: Calling window.snap.pay with token");

    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        console.log("PayWithSnap: Payment success:", result);
        setIsProcessing(false);
        onSuccess?.(result);
      },
      onPending: (result) => {
        console.log("PayWithSnap: Payment pending:", result);
        setIsProcessing(false);
        onPending?.(result);
      },
      onError: (result) => {
        console.error("PayWithSnap: Payment error:", result);
        setIsProcessing(false);
        onError?.(result);
      },
      onClose: () => {
        console.log("PayWithSnap: Payment popup closed");
        setIsProcessing(false);
        onClose?.();
      },
    });
  }, [snapToken, onSuccess, onPending, onError, onClose]);

  // Auto-open payment popup if autoOpen is true
  useEffect(() => {
    console.log("PayWithSnap: autoOpen effect - autoOpen:", autoOpen, "isSnapReady:", isSnapReady, "snapToken:", !!snapToken, "isProcessing:", isProcessing);
    if (autoOpen && isSnapReady && snapToken && !isProcessing) {
      console.log("PayWithSnap: Auto-opening payment popup");
      handlePayment();
    }
  }, [autoOpen, isSnapReady, snapToken, isProcessing, handlePayment]);

  if (isLoading) {
    return (
      <Button disabled className={buttonClassName}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Memuat...
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || !isSnapReady || isProcessing || !snapToken}
      className={buttonClassName}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}
