import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface SubscriptionStatus {
  isActive: boolean;
  planName: string | null;
  endDate: string | null;
  daysRemaining: number | null;
}

interface PaymentData {
  payment_id: string;
  qris_link: string;
  ref_code: string;
  amount: number;
}

export function useQrisPayment() {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    planName: null,
    endDate: null,
    daysRemaining: null,
  });

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select(`
          *,
          plans (
            name,
            price,
            duration_days
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (subscription && subscription.end_date) {
        const endDate = new Date(subscription.end_date);
        const today = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        setSubscriptionStatus({
          isActive: daysRemaining > 0,
          planName: subscription.plans?.name || null,
          endDate: subscription.end_date,
          daysRemaining: daysRemaining > 0 ? daysRemaining : null,
        });
      } else {
        setSubscriptionStatus({
          isActive: false,
          planName: null,
          endDate: null,
          daysRemaining: null,
        });
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }, []);

  const createPayment = useCallback(async (planName: string = "Premium"): Promise<PaymentData | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get plan
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("name", planName)
        .single();

      if (planError || !plan) throw new Error("Plan not found");

      // Create payment record
      const refCode = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const qrisLink = `https://api.qris.id/v1/qr?amount=${plan.price}&ref=${refCode}`;

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: plan.price,
          payment_type: "subscription",
          ref_code: refCode,
          qris_link: qrisLink,
          status: "pending",
          metadata: { plan_id: plan.id },
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      return {
        payment_id: payment.id,
        qris_link: qrisLink,
        ref_code: refCode,
        amount: plan.price,
      };
    } catch (error) {
      console.error("Error creating payment:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (refCode: string): Promise<"pending" | "paid" | "failed"> => {
    try {
      const { data: payment } = await supabase
        .from("payments")
        .select("status")
        .eq("ref_code", refCode)
        .single();

      return payment?.status || "pending";
    } catch (error) {
      console.error("Error checking payment status:", error);
      return "pending";
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  return {
    loading,
    subscriptionStatus,
    createPayment,
    checkPaymentStatus,
    refreshSubscription: fetchSubscriptionStatus,
  };
}
