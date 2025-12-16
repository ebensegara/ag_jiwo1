"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Professional {
  id: string;
  full_name: string;
  price_per_session: number;
}

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfessional();
  }, [params.id]);

  const fetchProfessional = async () => {
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("id, full_name, price_per_session")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setProfessional(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load professional",
        variant: "destructive",
      });
    }
  };

  const handleContinueToPayment = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await getSafeUser();
      if (!user) {
        router.replace("/auth");
        return;
      }

      // Combine date and time
      const [hours, minutes] = selectedTime.split(":");
      const scheduleTime = new Date(selectedDate);
      scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Create session record
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          professional_id: params.id,
          schedule_time: scheduleTime.toISOString(),
          price: professional?.price_per_session || 0,
          status: "pending",
          notes,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Navigate to payment page with session ID
      router.push(`/professionals/${params.id}/payment?session_id=${session.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Book Session with {professional?.full_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-4">Select Time</h3>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={selectedTime === time ? "bg-[#756657] hover:bg-[#756657]/90" : ""}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Notes (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific topics or concerns you'd like to discuss..."
                className="w-full min-h-[100px] p-3 border rounded-md"
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-[#756657]">
                  Rp {professional?.price_per_session.toLocaleString()}
                </span>
              </div>
              <Button
                onClick={handleContinueToPayment}
                disabled={!selectedDate || !selectedTime || isLoading}
                className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
                size="lg"
              >
                {isLoading ? "Processing..." : "Continue to Payment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}