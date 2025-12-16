"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shouldShowPage, setShouldShowPage] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);

    // First-visit redirect logic - only runs once on mount
    if (typeof window !== "undefined") {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");

      if (!hasSeenWelcome) {
        localStorage.setItem("hasSeenWelcome", "true");
        router.replace("/welcome");
      } else {
        setShouldShowPage(true);
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!existingUser) {
          await supabase.from("users").insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || "",
              role: "user",
            },
          ]);
        }

        toast({
          title: "Selamat datang kembali!",
          description: "Anda berhasil masuk.",
        });

        router.push("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !shouldShowPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#e6e2df] to-[#9e8d7d] dark:from-[#1a1618] dark:to-[#4d4349]">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#161315] dark:text-[#f7f7f7]">
            Jiwo.AI
          </h1>
          <p className="text-[#9e8d7d] dark:text-[#7c6a76] mt-2">
            Teman Anda untuk kesehatan mental
          </p>
        </div>

        <div className="bg-[#e6e2df]/50 dark:bg-[#1a1618]/50 p-8 rounded-xl shadow-2xl backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-center text-[#161315] dark:text-[#f7f7f7] mb-6">
            Masuk
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-[#161315] dark:text-[#f7f7f7]"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anda@example.com"
                required
                className="mt-1 block w-full px-4 py-3 bg-[#e6e2df]/70 dark:bg-[#1a1618]/70 border-0 rounded-xl text-[#161315] dark:text-[#f7f7f7] placeholder-[#9e8d7d] dark:placeholder-[#7c6a76] focus:ring-2 focus:ring-[#765567] focus:outline-none"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-[#161315] dark:text-[#f7f7f7]"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1 block w-full px-4 py-3 bg-[#e6e2df]/70 dark:bg-[#1a1618]/70 border-0 rounded-xl text-[#161315] dark:text-[#f7f7f7] placeholder-[#9e8d7d] dark:placeholder-[#7c6a76] focus:ring-2 focus:ring-[#765567] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#756657] hover:bg-[#7A5CE8] py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>

            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={() => router.push("/auth/signup")}
                className="text-sm text-[#8B6CFD] hover:underline block w-full"
              >
                Belum punya akun? Daftar sekarang
              </button>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Apakah Anda HR Admin?
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/corporate/setup")}
                  className="text-sm text-[#8B6CFD] hover:underline font-medium"
                >
                  Setup Program Corporate Wellness →
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
