"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubscriptionBannerProps {
  userId?: string;
}

export default function SubscriptionBanner({ userId }: SubscriptionBannerProps) {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      checkSubscription();
    }
  }, [userId]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("user_id", userId)
        .eq("status", "active")
        .gte("end_date", new Date().toISOString())
        .single();

      if (!error && data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (subscription) {
    return (
      <Card className="bg-gradient-to-r from-[#756657] to-[#9e8d7d] border-none text-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6" />
            <div>
              <p className="font-semibold">{subscription.plans.name} Member</p>
              <p className="text-sm opacity-90">
                Active until {new Date(subscription.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-none">
            Active
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-[#e6e2df] to-[#9e8d7d] dark:from-[#1a1618] dark:to-[#4d4349] border-none">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-[#756657]" />
          <div>
            <p className="font-semibold text-[#756657] dark:text-[#e6e2df]">
              Upgrade to Premium
            </p>
            <p className="text-sm text-[#9e8d7d] dark:text-[#7c6a76]">
              Unlimited AI chat & more features
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/plans")}
          className="bg-[#756657] hover:bg-[#756657]/90 text-white"
        >
          Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}
