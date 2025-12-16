'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bell, ArrowLeft, TrendingUp, TrendingDown, Share2, Download, Calendar } from 'lucide-react';
import { supabase, getSafeUser } from "@/lib/supabase";

interface WeeklyInsightsProps {
  onNavigate?: (tab: string) => void;
}

interface MoodData {
  day: string;
  mood: number;
  activity: number;
}

interface InsightData {
  moodAverage: number;
  moodTrend: number;
  activityAverage: number;
  activityTrend: number;
  weeklyData: MoodData[];
  keyObservations: string;
  journalInsights: string;
  screeningResults: string;
}

const mockWeeklyData: MoodData[] = [
  { day: 'Mon', mood: 3.5, activity: 3.5 },
  { day: 'Tue', mood: 4.5, activity: 4.5 },
  { day: 'Wed', mood: 4.2, activity: 4.2 },
  { day: 'Thu', mood: 3.8, activity: 4.0 },
  { day: 'Fri', mood: 4.1, activity: 3.5 },
  { day: 'Sat', mood: 2.8, activity: 2.0 },
  { day: 'Sun', mood: 2.9, activity: 2.0 },
];

export default function WeeklyInsights() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moodData, setMoodData] = useState<MoodData[]>([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const user = await getSafeUser();
      if (!user) return;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMoodData(data || []);
    } catch (error: any) {
      // Silent fail for insights
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Weekly Mental Health Insights',
          text: `This week's mood average: ${insights?.moodAverage}/5. Check out my mental wellness journey with Jiwo.AI`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSave = () => {
    const insightText = `
Weekly Mental Health Insights - ${new Date().toLocaleDateString()}

Mood Average: ${insights?.moodAverage}/5 (${insights?.moodTrend > 0 ? '+' : ''}${insights?.moodTrend}%)
Activity Average: ${insights?.activityAverage}/5 (${insights?.activityTrend > 0 ? '+' : ''}${insights?.activityTrend}%)

Key Observations:
${insights?.keyObservations}

Journal Insights:
${insights?.journalInsights}

Self-Screening Results:
${insights?.screeningResults}
    `;

    const blob = new Blob([insightText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-insights-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Generating your weekly insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Jiwo.AI</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </button>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">
                Community
              </a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">
                Resources
              </a>
            </nav>
            
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-gray-800 dark:text-white">
                  Your Weekly Insights
                </h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  Based on your mood tracking, journal entries, and self-screening results.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Week of {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Mood Trends Card */}
            <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Mood Trends
                </h3>
                <p className="text-4xl font-bold text-gray-800 dark:text-white">
                  Average: {insights?.moodAverage}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 Days</p>
                  <div className={`flex items-center text-sm font-medium ${
                    insights?.moodTrend && insights.moodTrend > 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {insights?.moodTrend && insights.moodTrend > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{insights?.moodTrend > 0 ? '+' : ''}{insights?.moodTrend}%</span>
                  </div>
                </div>
                
                {/* Simple Chart */}
                <div className="mt-6 h-32">
                  <div className="flex items-end justify-between h-full gap-2">
                    {insights?.weeklyData.map((day, index) => (
                      <div key={day.day} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-primary/30 rounded-t-lg transition-all duration-500"
                          style={{ height: `${(day.mood / 5) * 100}%` }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {day.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Levels Card */}
            <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Activity Levels
                </h3>
                <p className="text-4xl font-bold text-gray-800 dark:text-white">
                  Average: {insights?.activityAverage}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 Days</p>
                  <div className={`flex items-center text-sm font-medium ${
                    insights?.activityTrend && insights.activityTrend > 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {insights?.activityTrend && insights.activityTrend > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{insights?.activityTrend > 0 ? '+' : ''}{insights?.activityTrend}%</span>
                  </div>
                </div>
                
                {/* Bar Chart */}
                <div className="mt-6 h-32">
                  <div className="flex items-end justify-between h-full gap-2">
                    {insights?.weeklyData.map((day, index) => (
                      <div key={day.day} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-primary/30 rounded-t-lg transition-all duration-500"
                          style={{ height: `${(day.activity / 5) * 100}%` }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {day.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Section */}
          <div className="space-y-6">
            <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Key Observations
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {insights?.keyObservations}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Journal Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {insights?.journalInsights}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Self-Screening Results
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {insights?.screeningResults}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <Button 
              onClick={() => onNavigate?.('chat')}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all"
            >
              Talk to AI Companion
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-black/50 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400 sm:px-6 lg:px-8">
          <p>© 2024 Jiwo.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}