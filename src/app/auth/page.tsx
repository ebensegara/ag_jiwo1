"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt started", { email });
    setLoading(true);

    try {
      console.log("Calling supabase.auth.signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Auth result:", { data, error });

      if (error) throw error;

      if (data.user) {
        console.log("User logged in:", data.user.id);
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single();

        console.log("Existing user check:", existingUser);

        if (!existingUser) {
          console.log("Creating new user record...");
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

        console.log("Redirecting to dashboard...");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#d1d0cf] to-[#756657]">
      {/* Back to Welcome */}
      <Link
        href="/welcome"
        className="absolute top-6 left-6 flex items-center gap-2 text-[#3D3D3D]/70 hover:text-[#3D3D3D] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Kembali</span>
      </Link>

      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image src="/images/jiwo-logo.png" alt="Jiwo.AI" width={160} height={100} className="object-contain" priority />
          </div>
          <p className="text-[#3D3D3D]/60 mt-1">Teman Anda untuk kesehatan mental</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-[#3D3D3D] mb-6">
            Masuk
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-[#3D3D3D]"
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
                className="mt-1.5 block w-full px-4 py-3 bg-[#F5F3F0] border-0 rounded-xl text-[#3D3D3D] placeholder-[#3D3D3D]/40 focus:ring-2 focus:ring-[#C4AB9C] focus:outline-none"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-[#3D3D3D]"
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
                className="mt-1.5 block w-full px-4 py-3 bg-[#F5F3F0] border-0 rounded-xl text-[#3D3D3D] placeholder-[#3D3D3D]/40 focus:ring-2 focus:ring-[#C4AB9C] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#e67b5e] hover:bg-[#d66b4e] py-6 text-lg font-semibold rounded-xl shadow-lg"
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

            <div className="text-center space-y-4 pt-4">
              <Link
                href="/auth/signup"
                className="text-sm text-[#e67b5e] hover:underline block w-full font-medium"
              >
                Belum punya akun? Daftar sekarang
              </Link>

              <div className="pt-4 border-t border-[#C4AB9C]/20">
                <p className="text-xs text-[#3D3D3D]/50 mb-2">
                  Apakah Anda HR Admin?
                </p>
                <Link
                  href="/corporate/setup"
                  className="text-sm text-[#C4AB9C] hover:underline font-medium"
                >
                  Setup Program Corporate Wellness →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
