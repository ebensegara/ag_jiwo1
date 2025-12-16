"use client";

import { useEffect, useState } from "react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await getSafeUser();
      
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = userData?.role || "user";

      // Use push instead of replace to maintain history
      if (role === "professional") {
        router.push("/dashboard/professional");
      } else if (role === "user") {
        router.push("/dashboard/user");
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "company_admin") {
        router.push("/dashboard/corporate");
      } else {
        router.push("/dashboard/user");
      }
    } catch (error) {
      console.error("Error:", error);
      router.push("/dashboard/user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD] mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );
}