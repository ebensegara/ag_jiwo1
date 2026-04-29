"use client";

import { useState, useEffect } from "react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    Calendar,
    ChevronLeft,
    Clock,
    Heart,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Moon,
    Trophy,
    TrendingUp,
    ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyJourneyPage() {
    const [userName, setUserName] = useState("Sarah");
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const user = await getSafeUser();
            if (!user) {
                // For demo purposes, we'll keep the name Sarah if not logged in
                return;
            }

            const { data: userData } = await supabase
                .from("users")
                .select("full_name")
                .eq("id", user.id)
                .single();

            if (userData) {
                setUserName(userData.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.replace("/welcome");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to logout",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-[#E8DDD2] font-sans selection:bg-[#756657]/30">
            {/* Navigation */}
            <nav className="border-b border-white/10 bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span className="bg-[#756657] p-1.5 rounded-lg text-xs">JIWO</span>
                            Wellness
                        </h1>
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                            <button
                                onClick={() => router.push("/dashboard/user")}
                                className="hover:text-white transition-colors"
                            >
                                Home
                            </button>
                            <button className="text-[#C4AB9C] border-b-2 border-[#C4AB9C] pb-4 -mb-4">My Journey</button>
                            <button className="hover:text-white transition-colors">Tools</button>
                            <button className="hover:text-white transition-colors">Settings</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="container mx-auto px-6 py-12">
                <div className="mb-12">
                    <button
                        onClick={() => router.push("/dashboard/user")}
                        className="flex items-center text-sm text-[#C4AB9C] hover:text-white transition-colors mb-6 group"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h2 className="text-4xl font-bold text-white mb-2">Welcome back, {userName}</h2>
                    <p className="text-gray-400 text-lg">Your mental wellness journey is looking steady this week.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        title="Total Minutes"
                        value="345 min"
                        icon={<Clock className="h-5 w-5" />}
                        color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                    />
                    <StatCard
                        title="Avg. Mood"
                        value="Calm"
                        icon={<Heart className="h-5 w-5" />}
                        color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    />
                    <StatCard
                        title="Sessions"
                        value="12 complete"
                        icon={<BarChart3 className="h-5 w-5" />}
                        color="bg-purple-500/10 text-purple-400 border-purple-500/20"
                    />
                    <StatCard
                        title="Next Goal"
                        value="Evening Breathe"
                        icon={<Trophy className="h-5 w-5" />}
                        color="bg-amber-500/10 text-amber-400 border-amber-500/20"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-[#1A1A1A] border-white/5 shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-white text-xl">Weekly Calmness Trend</CardTitle>
                                    <p className="text-sm text-gray-400">Mood stability over the last 7 days</p>
                                </div>
                                <TrendingUp className="text-[#C4AB9C] h-6 w-6" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 w-full flex items-end justify-between gap-2 pt-8">
                                    {[40, 65, 55, 80, 70, 90, 85].map((height, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                            <div
                                                className="w-full bg-gradient-to-t from-[#756657] to-[#C4AB9C] rounded-t-lg transition-all duration-500 hover:brightness-125"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                            <span className="text-xs text-gray-500">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-[#1A1A1A] border-white/5 overflow-hidden group">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-[#C4AB9C]" />
                                        Activity Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ActivityItem label="Breathing" value={45} color="bg-blue-400" />
                                    <ActivityItem label="Meditation" value={30} color="bg-purple-400" />
                                    <ActivityItem label="Journaling" value={20} color="bg-amber-400" />
                                    <ActivityItem label="Art Therapy" value={5} color="bg-emerald-400" />
                                </CardContent>
                            </Card>

                            <Card className="bg-[#1A1A1A] border-white/5">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-[#C4AB9C]" />
                                        Current Streak
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-[#756657] mb-4">
                                        <span className="text-4xl font-bold text-white">14</span>
                                    </div>
                                    <h4 className="text-xl font-semibold text-gray-200">Days in a row</h4>
                                    <p className="text-sm text-gray-400 mt-2">Keep it up! You're 7 days away from earning the "Zen Master" badge.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar - Recent Journals */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Recent Journals</h3>
                            <button className="text-[#C4AB9C] text-sm flex items-center gap-1 hover:underline">
                                View All <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>

                        <JournalCard
                            title="Morning Reflection"
                            date="Today, 8:30 AM"
                            content="Woke up feeling a bit anxious about the presentation, but did a 5-minute breathing exercise. Feeling much more centered now..."
                            icon={<TrendingUp className="h-4 w-4" />}
                        />

                        <JournalCard
                            title="Post-Work Anxiety"
                            date="Yesterday, 6:15 PM"
                            content="Rough meeting with the team today. Felt my heart racing around 3 PM. Used the 'Quick Relief' button and it guided me through grounding techniques."
                            icon={<Heart className="h-4 w-4" />}
                        />

                        <JournalCard
                            title="Weekend Gratitude"
                            date="Sunday, 4:00 PM"
                            content="Spent the day in the park reading. It's amazing how much disconnecting from screens helps my baseline anxiety levels."
                            icon={<Moon className="h-4 w-4" />}
                        />
                    </div>
                </div>
            </main>

            {/* Premium CTA */}
            <section className="container mx-auto px-6 py-12">
                <div className="bg-gradient-to-r from-[#756657] to-[#3D3D3D] rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl">
                    <div className="max-w-xl">
                        <h3 className="text-3xl font-bold text-white mb-4">Level up your mindfulness</h3>
                        <p className="text-[#E8DDD2]/80 text-lg">
                            Unlock personalized insights, premium soundscapes, and advanced therapy tools with JIWO+
                        </p>
                    </div>
                    <Button className="bg-[#E8DDD2] text-[#3D3D3D] hover:bg-white px-8 py-6 rounded-xl text-lg font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        Upgrade Now
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 mt-12 bg-[#0A0A0A]">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-gray-500 text-sm">© 2026 JIWO.AI - Mental Wellness Companion</p>
                        <div className="flex gap-8 text-sm text-gray-400">
                            <button className="hover:text-white transition-colors">Privacy Policy</button>
                            <button className="hover:text-white transition-colors">Crisis Resources</button>
                            <button className="hover:text-white transition-colors">Support</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
    return (
        <Card className="bg-[#1A1A1A] border-white/5 hover:border-white/10 transition-colors shadow-lg group">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl border ${color} transition-transform group-hover:scale-110`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                </div>
            </CardContent>
        </Card>
    );
}

function ActivityItem({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-300">{label}</span>
                <span className="text-gray-500 font-medium">{value}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
}

function JournalCard({ title, date, content, icon }: { title: string; date: string; content: string; icon: React.ReactNode }) {
    return (
        <Card className="bg-[#1A1A1A] border-white/5 hover:bg-[#222222] transition-colors cursor-pointer group">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[#C4AB9C]">{icon}</span>
                        <h4 className="font-bold text-white group-hover:text-[#C4AB9C] transition-colors">{title}</h4>
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{date}</span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed italic">
                    "{content}"
                </p>
            </CardContent>
        </Card>
    );
}
