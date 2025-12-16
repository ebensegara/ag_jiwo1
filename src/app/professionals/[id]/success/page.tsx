"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Session {
  id: string;
  schedule_time: string;
  price: number;
  professional_id: string;
  professionals: {
    full_name: string;
  };
}

export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [searchParams]);

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load session",
        variant: "destructive",
      });
    }
  };

  const handleStartSession = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const user = await getSafeUser();
      if (!user) {
        router.replace("/auth");
        return;
      }

      // Check if chat channel exists
      const { data: existingChannel } = await supabase
        .from("chat_channels")
        .select("id")
        .eq("user_id", user.id)
        .eq("professional_id", session.professional_id)
        .single();

      let channelId = existingChannel?.id;

      if (!channelId) {
        // Create new chat channel
        const { data: newChannel, error: channelError } = await supabase
          .from("chat_channels")
          .insert({
            user_id: user.id,
            professional_id: session.professional_id,
            booking_id: session.id,
          })
          .select()
          .single();

        if (channelError) throw channelError;
        channelId = newChannel.id;
      }

      // Navigate to chat
      router.push(`/chat/${channelId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
              <CardTitle className="text-2xl text-center">
                Booking Confirmed!
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Your session with</p>
                <p className="text-2xl font-bold text-[#756657]">
                  {session.professionals.full_name}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">
                  {new Date(session.schedule_time).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="border-t pt-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                <p className="text-2xl font-bold">
                  Rp {session.price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleStartSession}
                disabled={isLoading}
                className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {isLoading ? "Opening Chat..." : "Start Session"}
              </Button>

              <Button
                onClick={() => router.push("/dashboard/user")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Dashboard
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>What's next?</strong> You can start chatting with your professional now or wait until your scheduled time. A confirmation has been sent to your email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}