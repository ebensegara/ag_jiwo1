"use client";

import { useEffect, useState } from "react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Calendar, Users, TrendingUp, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import ProfessionalInbox from "@/components/professional-inbox";

interface ProfessionalStats {
  totalBookings: number;
  activeChats: number;
  totalRevenue: number;
  avgRating: number;
}

export default function ProfessionalDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [stats, setStats] = useState<ProfessionalStats>({
    totalBookings: 0,
    activeChats: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  useEffect(() => {
    checkProfessionalAccess();
  }, []);

  const checkProfessionalAccess = async () => {
    try {
      const user = await getSafeUser();
      
      if (!user) {
        router.replace("/auth");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "professional") {
        toast({
          title: "Access Denied",
          description: "You don't have professional privileges",
          variant: "destructive",
        });
        router.replace("/dashboard");
        return;
      }

      // Fetch professional data
      const { data: profData } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profData) {
        toast({
          title: "Profile Not Found",
          description: "Professional profile not found. Please contact admin.",
          variant: "destructive",
        });
        router.replace("/dashboard");
        return;
      }

      setProfessionalData(profData);
      setIsAvailable(profData.is_available || false);
      await loadStats(user.id);
    } catch (error) {
      console.error("Error checking professional access:", error);
      router.replace("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async (userId: string) => {
    try {
      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("professional_id", userId);

      // Fetch active chats
      const { data: chats } = await supabase
        .from("chat_channels")
        .select("*")
        .eq("professional_id", userId)
        .eq("status", "active");

      // Calculate revenue
      const totalRevenue = bookings?.reduce((sum, booking) => {
        return sum + (booking.amount || 0);
      }, 0) || 0;

      setStats({
        totalBookings: bookings?.length || 0,
        activeChats: chats?.length || 0,
        totalRevenue,
        avgRating: professionalData?.rating || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      const user = await getSafeUser();
      if (!user) return;

      const { error } = await supabase
        .from("professionals")
        .update({ is_available: checked })
        .eq("user_id", user.id);

      if (error) throw error;

      setIsAvailable(checked);
      toast({
        title: checked ? "You're now available" : "You're now offline",
        description: checked 
          ? "Users can now start conversations with you" 
          : "Users won't be able to start new conversations",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      router.replace("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Welcome, {professionalData?.full_name}!
              </h1>
              <p className="text-sm text-muted-foreground">
                {professionalData?.category} - {professionalData?.specialization}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Availability Switch */}
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                <Label htmlFor="availability" className="text-sm font-medium cursor-pointer">
                  {isAvailable ? "🟢 Available" : "🔴 Offline"}
                </Label>
                <Switch
                  id="availability"
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                />
              </div>
              <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-[#8B6CFD]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.totalBookings}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Chats
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-[#8B6CFD]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.activeChats}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[#8B6CFD]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                IDR {stats.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Rating
              </CardTitle>
              <Users className="h-4 w-4 text-[#8B6CFD]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                ⭐ {stats.avgRating.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Inbox & Chat
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox">
            <ProfessionalInbox />
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Bookings management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}