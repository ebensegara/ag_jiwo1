"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import Ipay88QrisModal from "@/components/ipay88-qris-modal";
import { format } from "date-fns";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  professional: {
    id: string;
    full_name: string;
    price_per_session: number;
  };
  onSuccess: () => void;
}

export default function BookingModal({
  open,
  onClose,
  professional,
  onSuccess,
}: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    }
  }, [date, professional.id]);

  const fetchAvailableSlots = async () => {
    if (!date) return;

    try {
      setSlotsLoading(true);
      const dayOfWeek = date.getDay();
      console.log("Fetching slots for:", { professionalId: professional.id, date, dayOfWeek });

      // 1. Fetch professional's availability slots for this day
      const { data: slots, error: slotsError } = await supabase
        .from("availability_slots")
        .select("start_time, end_time")
        .eq("professional_id", professional.id)
        .eq("day_of_week", dayOfWeek);

      if (slotsError) {
        console.error("Slots fetch error:", slotsError);
        throw slotsError;
      }
      console.log("Raw availability slots from DB:", slots);

      // 2. Fetch existing bookings for this professional on this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("session_time")
        .eq("professional_id", professional.id)
        .gte("session_time", startOfDay.toISOString())
        .lte("session_time", endOfDay.toISOString())
        .not("status", "eq", "cancelled");

      if (bookingsError) {
        console.error("Bookings fetch error:", bookingsError);
        throw bookingsError;
      }

      const bookedTimes = bookings?.map(b => format(new Date(b.session_time), "HH:mm")) || [];
      console.log("Existing booked times:", bookedTimes);

      // 3. Generate hourly slots from availability
      const generatedSlots: string[] = [];
      slots?.forEach(slot => {
        let current = slot.start_time.substring(0, 5);
        const end = slot.end_time.substring(0, 5);

        while (current < end) {
          if (!bookedTimes.includes(current)) {
            generatedSlots.push(current);
          }

          // Increment by 1 hour
          const [h, m] = current.split(":").map(Number);
          const nextH = h + 1;
          current = `${nextH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
      });

      setAvailableSlots(generatedSlots.sort());
      if (generatedSlots.length > 0 && !generatedSlots.includes(time)) {
        setTime(generatedSlots[0]);
      }
    } catch (error: any) {
      console.error("Error fetching slots:", error);
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      });
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const user = await getSafeUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please login to book a session",
          variant: "destructive",
        });
        return;
      }

      // Combine date and time
      const sessionDateTime = new Date(date);
      const [hours, minutes] = time.split(":");
      sessionDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          professional_id: professional.id,
          session_time: sessionDateTime.toISOString(),
          start_time: sessionDateTime.toISOString(),
          end_time: new Date(sessionDateTime.getTime() + 60 * 60 * 1000).toISOString(),
          price: professional.price_per_session,
          status: "pending",
          payment_status: "unpaid",
          notes,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment with iPay88 QRIS
      const response = await fetch("/api/payment/ipay88", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          amount: professional.price_per_session,
          payment_type: "booking",
          metadata: {
            booking_id: booking.id,
            session_id: booking.id,
            professional_id: professional.id,
            professional_name: professional.full_name,
            session_time: sessionDateTime.toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (result.success && result.checkout_id) {
        setPaymentData(result);
        setShowPayment(true);

        // TODO: Trigger n8n webhook for booking creation notification
        console.log("n8n Webhook: Booking Created", { bookingId: booking.id, userId: user.id });
      } else {
        throw new Error(result.error || "Failed to create payment");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setPaymentData(null);
    onClose();

    // Update booking payment status locally (usually handled by webhook)
    toast({
      title: "Booking Confirmed! 🎉",
      description: "Your session has been booked successfully",
    });

    // TODO: Trigger n8n webhook for payment confirmation & session link generation
    console.log("n8n Webhook: Payment Success & Session Link Generation");

    onSuccess();
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setPaymentData(null);
  };

  // Disable past dates
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <>
      <Dialog open={open && !showPayment} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Session with {professional.full_name}</DialogTitle>
            <DialogDescription>
              Price: Rp {professional.price_per_session.toLocaleString()} per session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Select Date
              </Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={disabledDays}
                  className="rounded-md border bg-white dark:bg-slate-800"
                  initialFocus
                />
              </div>
              {date && (
                <p className="text-sm text-center mt-2 text-[#756657] dark:text-[#e6e2df] font-medium">
                  Selected: {format(date, "EEEE, MMMM d, yyyy")}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold mb-3">Select Time</Label>
              {slotsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#8B6CFD]" />
                </div>
              ) : !date ? (
                <p className="text-sm text-muted-foreground text-center py-4">Please select a date first</p>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm text-red-500 font-medium">No slots available for this date.</p>
                  <p className="text-xs text-muted-foreground">The professional may not have configured their schedule for this day.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={time === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTime(slot)}
                      className={time === slot ? "bg-[#756657] hover:bg-[#756657]/90" : ""}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold mb-2">Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or topics you'd like to discuss..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleBookSession}
              disabled={loading || !date}
              className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* iPay88 QRIS Payment Modal */}
      {showPayment && paymentData && (
        <Ipay88QrisModal
          isOpen={showPayment}
          onClose={handlePaymentClose}
          paymentData={{
            checkout_url: paymentData.checkout_url,
            checkout_id: paymentData.checkout_id,
            checkout_signature: paymentData.checkout_signature,
            ref_code: paymentData.ref_code,
            payment_id: paymentData.payment_id,
            amount: paymentData.amount,
            expiry_time: paymentData.expiry_time,
          }}
          onSuccess={handlePaymentSuccess}
          type="booking"
        />
      )}
    </>
  );
}