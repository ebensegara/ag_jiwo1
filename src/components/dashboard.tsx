"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  BookOpen,
  Heart,
  Users,
  ArrowRight,
  Bell,
  ClipboardList,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

interface DashboardStats {
  totalMoods: number;
  totalJournals: number;
  averageMood: number;
  recentMood: string;
  weeklyProgress: number;
}

const features = [
  {
    id: "chat",
    title: "AI Companion",
    description: "Chat for instant support and guidance.",
    icon: MessageCircle,
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
  },
  {
    id: "journal",
    title: "Journal",
    description: "Reflect on your thoughts and feelings.",
    icon: BookOpen,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  },
  {
    id: "mood",
    title: "Mood Tracker",
    description: "Identify patterns in your emotional well-being.",
    icon: Heart,
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
  },
  {
    id: "screening",
    title: "Self Screening",
    description: "Take a quick assessment of your mental health.",
    icon: ClipboardList,
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&q=80",
  },
  {
    id: "insights",
    title: "Weekly Insights",
    description: "View your personalized mental health analytics.",
    icon: TrendingUp,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  },
  {
    id: "professionals",
    title: "Professional Care",
    description: "Get personalized professional recommendations.",
    icon: Users,
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80",
  },
  {
    id: "yoga-studio",
    title: "Holistic Care",
    description: "Find your flow with guided yoga practices.",
    icon: Heart,
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
  },
  {
    id: "art-therapy",
    title: "Art Therapy",
    description: "Express yourself through creative healing.",
    icon: Heart,
    image:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=80",
  },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalMoods: 0,
    totalJournals: 0,
    averageMood: 0,
    recentMood: "Neutral",
    weeklyProgress: 0,
  });
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // TAMBAHKAN DI SINI 👇
  const featureColors: { [key: string]: string } = {
    chat: "bg-[#CB997E] hover:bg-[#CB997E]/90",
    journal: "bg-[#B7B7A4] hover:bg-[#B7B7A4]/90",
    mood: "bg-[#6B705C] hover:bg-[#6B705C]/90",
    screening: "bg-[#756657] hover:bg-[#756657]/90",
    insights: "bg-blue-500 hover:bg-blue-600",
    professionals: "bg-purple-500 hover:bg-purple-600",
    "yoga-studio": "bg-green-500 hover:bg-green-600",
    "art-therapy": "bg-pink-500 hover:bg-pink-600",
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = await getSafeUser();
      if (!user) return;

      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || "Friend");
      }

      // Fetch mood stats
      const { data: moods } = await supabase
        .from("moods")
        .select("mood_value, mood_label, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch journal count
      const { count: journalCount } = await supabase
        .from("journals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Calculate stats
      if (moods && moods.length > 0) {
        const avgMood =
          moods.reduce((sum, m) => sum + m.mood_value, 0) / moods.length;
        const recentMood = moods[0].mood_label;

        // Calculate weekly progress (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyMoods = moods.filter(
          (m) => new Date(m.created_at) >= weekAgo,
        );
        const weeklyProgress = weeklyMoods.length;

        setStats({
          totalMoods: moods.length,
          totalJournals: journalCount || 0,
          averageMood: avgMood,
          recentMood,
          weeklyProgress,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });

      router.replace('/welcome');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Jiwo.AI
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => onNavigate("dashboard")}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => onNavigate("chat")}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                AI Companion
              </button>
              <button
                onClick={() => onNavigate("journal")}
                className="text-sm font-medium text-[#CB997E] dark:text-[#CB997E] hover:text-[#CB997E]/80 transition-colors"
              >
                Journal
              </button>
              <button
                onClick={() => onNavigate("mood")}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Mood Tracker
              </button>
              <a
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                href="#"
              >
                Professionals
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-primary uppercase tracking-widest">
                Welcome Back{userName ? `, ${userName}` : ""}
              </p>
              <h2 className="mt-2 text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Your Mental Health Dashboard
              </h2>
            </div>

            {/* Stats Cards */}
            {!isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-lg border-white/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {stats.totalMoods}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mood Entries
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-lg border-white/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {stats.totalJournals}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Journal Entries
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-lg border-white/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {stats.averageMood.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg Mood
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-lg border-white/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {stats.weeklyProgress}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      This Week
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className="bg-white/20 dark:bg-black/20 backdrop-blur-lg border-white/20 shadow-lg overflow-hidden group transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {feature.title}
                          </h3>
                          <p className="mt-2 text-gray-600 dark:text-gray-300">
                            {feature.description}
                          </p>
                        </div>
                        <div
                          className="w-24 h-24 rounded-lg bg-cover bg-center ml-6"
                          style={{ backgroundImage: `url("${feature.image}")` }}
                        />
                      </div>
                      <Button
                        onClick={() => onNavigate(feature.id)}
                        className={`mt-6 w-full ${featureColors[feature.id] || "bg-primary hover:bg-primary/90"} text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2`}
                      >
                        <span>
                          {feature.id === "chat" && "Start Chat"}
                          {feature.id === "journal" && "Open Journal"}
                          {feature.id === "mood" && "Track Mood"}
                          {feature.id === "screening" && "Take Assessment"}
                          {feature.id === "insights" && "View Insights"}
                          {feature.id === "professionals" &&
                            "View Recommendations"}
                          {feature.id === "yoga-studio" && "Start Practice"}
                          {feature.id === "art-therapy" && "Begin Creating"}
                        </span>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 dark:bg-black/10 mt-auto border-t border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 Jiwo.AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}