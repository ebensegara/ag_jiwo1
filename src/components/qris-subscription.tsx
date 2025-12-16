"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Crown, CheckCircle2, Loader2 } from "lucide-react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import PayWithSnap from "@/components/payments/PayWithSnap";

interface SubscriptionStatus {
  isActive: boolean;
  planName: string | null;
  endDate: string | null;
  daysRemaining: number | null;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
  description: string;
}

export default function QrisSubscription() {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    planName: null,
    endDate: null,
    daysRemaining: null,
  });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchSubscriptionStatus = async () => {
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
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleUpgradeClick = () => {
    setShowPlanModal(true);
  };

  const handlePlanSelect = async (plan: Plan) => {
    setSelectedPlan(plan);
    setLoading(true);
    
    try {
      const user = await getSafeUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please login first",
          variant: "destructive",
        });
        return;
      }

      // Create payment with Midtrans Snap
      const response = await fetch("/api/payment/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          amount: plan.price,
          payment_type: "subscription",
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            duration_days: plan.duration_days,
          },
        }),
      });

      const result = await response.json();

      if (result.success && result.snap_token) {
        setSnapToken(result.snap_token);
        setShowPlanModal(false);
        setShowPayment(true);
      } else {
        throw new Error(result.error || "Failed to create payment");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    toast({
      title: "Payment Successful!",
      description: "Your subscription has been activated",
    });
    setShowPayment(false);
    setSnapToken(null);
    await fetchSubscriptionStatus();
  };

  const handlePaymentPending = () => {
    setShowPayment(false);
    setSnapToken(null);
    toast({
      title: "Payment Pending",
      description: "Please complete your payment to activate subscription",
    });
  };

  const handlePaymentError = () => {
    setShowPayment(false);
    setSnapToken(null);
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment",
      variant: "destructive",
    });
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setSnapToken(null);
  };

  return (
    <>
      <Card className="border-[#756657]/20 bg-gradient-to-br from-white to-[#756657]/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-[#756657]" />
              <CardTitle className="text-[#756657]">Premium Subscription</CardTitle>
            </div>
            {subscriptionStatus.isActive && (
              <Badge className="bg-[#756657] hover:bg-[#756657]/90">
                Active
              </Badge>
            )}
          </div>
          <CardDescription>
            {subscriptionStatus.isActive
              ? `Your ${subscriptionStatus.planName} plan is active`
              : "Unlock unlimited access to all features"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionStatus.isActive ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#756657]/10 rounded-lg">
                <span className="text-sm font-medium">Days Remaining</span>
                <span className="text-lg font-bold text-[#756657]">
                  {subscriptionStatus.daysRemaining} days
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#756657]" />
                  <span>Unlimited AI Chat</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#756657]" />
                  <span>Priority Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#756657]" />
                  <span>Advanced Analytics</span>
                </div>
              </div>
              <Button
                onClick={handleUpgradeClick}
                disabled={loading}
                className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Perpanjang Subscription
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Unlimited AI Chat</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Priority Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Access to All Professionals</span>
                </div>
              </div>
              <Button
                onClick={handleUpgradeClick}
                disabled={loading}
                className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade Sekarang
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Selection Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#756657]">Pilih Paket Subscription</DialogTitle>
            <DialogDescription>
              Pilih paket yang sesuai dengan kebutuhan Anda
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className="border-[#756657]/20 hover:border-[#756657] transition-all cursor-pointer"
                onClick={() => handlePlanSelect(plan)}
              >
                <CardHeader>
                  <CardTitle className="text-[#756657]">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-[#756657]/10 rounded-lg">
                    <p className="text-3xl font-bold text-[#756657]">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plan.duration_days} hari
                    </p>
                  </div>
                  
                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#756657]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pilih Paket"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Snap Payment - Auto opens when token is ready */}
      {showPayment && snapToken && (
        <PayWithSnap
          snapToken={snapToken}
          onSuccess={handlePaymentSuccess}
          onPending={handlePaymentPending}
          onError={handlePaymentError}
          onClose={handlePaymentClose}
          autoOpen={true}
        />
      )}
    </>
  );
}