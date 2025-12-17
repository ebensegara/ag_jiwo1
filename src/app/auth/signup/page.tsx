"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Heart } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "professional">("user");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: role,
          },
          {
            onConflict: "id",
            ignoreDuplicates: false,
          },
        );

        if (profileError) throw profileError;

        if (role === "professional") {
          const { error: professionalError } = await supabase
            .from("professionals")
            .upsert(
              {
                user_id: data.user.id,
                full_name: fullName,
                specialization: "",
                bio: "",
                photo_url: "",
              },
              {
                onConflict: "user_id",
                ignoreDuplicates: false,
              },
            );

          if (professionalError) throw professionalError;
        }
      }

      toast({
        title: "Akun berhasil dibuat!",
        description: `Anda terdaftar sebagai ${role === "user" ? "pengguna" : "profesional"}.`,
      });

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!loginError) {
        router.push("/dashboard");
      } else {
        router.push("/auth");
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#d1d0cf] to-[#756657]">
      {/* Back Button */}
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
          <div className="w-16 h-16 bg-gradient-to-br from-[#C4AB9C] to-[#e67b5e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#3D3D3D]">
            Jiwo<span className="text-[#e67b5e]">.AI</span>
          </h1>
          <p className="text-[#3D3D3D]/60 mt-2">
            Teman Anda untuk kesehatan mental
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-[#3D3D3D] mb-6">
            Daftar
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-[#3D3D3D]"
              >
                Nama Panggilan
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Anda"
                required
                className="mt-1.5 block w-full px-4 py-3 bg-[#F5F3F0] border-0 rounded-xl text-[#3D3D3D] placeholder-[#3D3D3D]/40 focus:ring-2 focus:ring-[#C4AB9C] focus:outline-none"
              />
            </div>

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

            <div>
              <Label className="text-sm font-medium text-[#3D3D3D] mb-3 block">
                Pilih Peran Anda
              </Label>
              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all duration-300 ${role === "user"
                      ? "bg-[#e67b5e]/10 border-2 border-[#e67b5e]"
                      : "bg-[#F5F3F0] border-2 border-transparent hover:border-[#C4AB9C]"
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                    className="w-5 h-5 mt-0.5 text-[#e67b5e] accent-[#e67b5e]"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-base text-[#3D3D3D] block">
                      Pengguna
                    </span>
                    <p className="text-xs text-[#3D3D3D]/60 mt-1">
                      Saya mencari dukungan kesehatan mental
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all duration-300 ${role === "professional"
                      ? "bg-[#e67b5e]/10 border-2 border-[#e67b5e]"
                      : "bg-[#F5F3F0] border-2 border-transparent hover:border-[#C4AB9C]"
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="professional"
                    checked={role === "professional"}
                    onChange={() => setRole("professional")}
                    className="w-5 h-5 mt-0.5 text-[#e67b5e] accent-[#e67b5e]"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-base text-[#3D3D3D] block">
                      Profesional
                    </span>
                    <p className="text-xs text-[#3D3D3D]/60 mt-1">
                      Saya adalah profesional kesehatan mental
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e67b5e] hover:bg-[#d66b4e] py-6 text-lg font-semibold rounded-xl shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat akun...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#3D3D3D]/60">
              Sudah punya akun?{" "}
              <Link
                href="/auth"
                className="text-[#e67b5e] hover:underline font-semibold"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
