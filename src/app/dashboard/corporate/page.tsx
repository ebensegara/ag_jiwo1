"use client";

import { useState, useEffect } from "react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  AlertCircle,
  Calendar,
  BarChart3,
  Brain,
  Loader2,
  LogOut,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface CompanyStats {
  totalEmployees: number;
  activeUsers: number;
  avgMoodScore: number;
  moodTrend: string;
  stressLevel: string;
  engagementRate: number;
  journalCount: number;
  sessionCount: number;
}

interface DepartmentInsight {
  department: string;
  avgMood: number;
  activeUsers: number;
  trend: string;
  alerts: string[];
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  department?: string;
}

export default function CorporateDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<CompanyStats>({
    totalEmployees: 0,
    activeUsers: 0,
    avgMoodScore: 0,
    moodTrend: "stable",
    stressLevel: "moderate",
    engagementRate: 0,
    journalCount: 0,
    sessionCount: 0,
  });
  const [departmentInsights, setDepartmentInsights] = useState<DepartmentInsight[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

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

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const user = await getSafeUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Check if user is company admin
      const { data: adminData } = await supabase
        .from("company_admins")
        .select("*, companies(*)")
        .eq("user_id", user.id)
        .single();

      if (!adminData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin access to corporate dashboard",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      setCompany(adminData.companies);
      await fetchDashboardData(adminData.companies.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async (companyId: string) => {
    try {
      // Fetch company employees
      const { data: employees } = await supabase
        .from("company_employees")
        .select("*, users(*)")
        .eq("company_id", companyId);

      const totalEmployees = employees?.length || 0;

      // Fetch mood data for the week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: moods } = await supabase
        .from("moods")
        .select("*, users!inner(company_id, department)")
        .eq("users.company_id", companyId)
        .gte("created_at", weekAgo.toISOString());

      // Calculate stats
      const avgMood = moods && moods.length > 0
        ? moods.reduce((sum, m) => sum + m.mood_value, 0) / moods.length
        : 0;

      const uniqueUsers = new Set(moods?.map(m => m.user_id) || []).size;

      // Fetch journal count
      const { count: journalCount } = await supabase
        .from("journals")
        .select("*, users!inner(company_id)", { count: "exact", head: true })
        .eq("users.company_id", companyId)
        .gte("created_at", weekAgo.toISOString());

      // Fetch session count
      const { count: sessionCount } = await supabase
        .from("bookings")
        .select("*, users!inner(company_id)", { count: "exact", head: true })
        .eq("users.company_id", companyId)
        .gte("created_at", weekAgo.toISOString());

      // Calculate department insights
      const deptMap = new Map<string, any>();
      moods?.forEach((mood: any) => {
        const dept = mood.users?.department || "Unassigned";
        if (!deptMap.has(dept)) {
          deptMap.set(dept, { moods: [], users: new Set() });
        }
        deptMap.get(dept).moods.push(mood.mood_value);
        deptMap.get(dept).users.add(mood.user_id);
      });

      const deptInsights: DepartmentInsight[] = Array.from(deptMap.entries()).map(([dept, data]) => {
        const avgMood = data.moods.reduce((a: number, b: number) => a + b, 0) / data.moods.length;
        return {
          department: dept,
          avgMood,
          activeUsers: data.users.size,
          trend: avgMood > 3.5 ? "positive" : avgMood < 2.5 ? "negative" : "stable",
          alerts: avgMood < 2.5 ? ["Low mood detected"] : [],
        };
      });

      // Generate AI insights
      const insights: AIInsight[] = [];

      // Stress peak analysis
      const mondayMoods = moods?.filter((m: any) => new Date(m.created_at).getDay() === 1) || [];
      if (mondayMoods.length > 5) {
        const mondayAvg = mondayMoods.reduce((sum, m) => sum + m.mood_value, 0) / mondayMoods.length;
        if (mondayAvg < 2.8) {
          insights.push({
            type: "stress_peak",
            title: "Monday Stress Pattern Detected",
            description: "Stress levels peak on Monday mornings around 10 AM. Consider implementing flexible start times or Monday wellness activities.",
            severity: "warning",
          });
        }
      }

      // Department engagement
      deptInsights.forEach(dept => {
        if (dept.avgMood < 2.5) {
          insights.push({
            type: "low_engagement",
            title: `${dept.department} - Low Engagement Alert`,
            description: `${dept.department} team showing decreased engagement this week. Recommend team check-in or wellness session.`,
            severity: "critical",
            department: dept.department,
          });
        }
      });

      // Overall trend
      if (avgMood > 3.5) {
        insights.push({
          type: "positive_trend",
          title: "Positive Wellness Trend",
          description: "Overall employee wellness is trending positively. Great work on maintaining a healthy work environment!",
          severity: "info",
        });
      }

      setStats({
        totalEmployees,
        activeUsers: uniqueUsers,
        avgMoodScore: avgMood,
        moodTrend: avgMood > 3.5 ? "positive" : avgMood < 2.5 ? "negative" : "stable",
        stressLevel: avgMood > 3.5 ? "low" : avgMood < 2.5 ? "high" : "moderate",
        engagementRate: totalEmployees > 0 ? (uniqueUsers / totalEmployees) * 100 : 0,
        journalCount: journalCount || 0,
        sessionCount: sessionCount || 0,
      });

      setDepartmentInsights(deptInsights);
      setAIInsights(insights);

      // Fetch alerts
      const { data: alertsData } = await supabase
        .from("company_alerts")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10);

      setAlerts(alertsData || []);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
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
                {company?.name} - Corporate Wellness Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                HR Analytics & Employee Wellness Insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
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
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-[#8B6CFD]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.totalEmployees}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeUsers} active this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Mood
              </CardTitle>
              <Activity className="h-4 w-4 text-[#8B6CFD]" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-gray-800 dark:text-white">
                  {stats.avgMoodScore.toFixed(1)}
                </div>
                {stats.moodTrend === "positive" ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : stats.moodTrend === "negative" ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
              <Badge
                className={`mt-2 ${
                  stats.stressLevel === "low"
                    ? "bg-green-500"
                    : stats.stressLevel === "high"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {stats.stressLevel} stress
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Engagement Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#8B6CFD]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.engagementRate.toFixed(0)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.journalCount} journal entries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Professional Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-[#8B6CFD]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.sessionCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-800">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#8B6CFD]" />
                  AI-Powered Insights for HR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No insights available yet. More data needed for analysis.
                  </p>
                ) : (
                  aiInsights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.severity === "critical"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                          : insight.severity === "warning"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className={`h-5 w-5 mt-0.5 ${
                            insight.severity === "critical"
                              ? "text-red-500"
                              : insight.severity === "warning"
                              ? "text-yellow-500"
                              : "text-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white">
                            {insight.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {insight.description}
                          </p>
                          {insight.department && (
                            <Badge className="mt-2" variant="outline">
                              {insight.department}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentInsights.map((dept, index) => (
                <Card key={index} className="bg-white dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">{dept.department}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Avg Mood
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 dark:text-white">
                            {dept.avgMood.toFixed(1)}
                          </span>
                          {dept.trend === "positive" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : dept.trend === "negative" ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Active Users
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          {dept.activeUsers}
                        </span>
                      </div>
                      {dept.alerts.length > 0 && (
                        <div className="pt-2 border-t">
                          {dept.alerts.map((alert, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              {alert}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No alerts at this time</p>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {alert.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            className={
                              alert.severity === "critical"
                                ? "bg-red-500"
                                : alert.severity === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}