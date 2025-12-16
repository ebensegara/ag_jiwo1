"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "professional">("user");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, [router]);

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

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e6e2df] to-[#9e8d7d] dark:from-[#1a1618] dark:to-[#4d4349]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#765567] mx-auto" />
          <p className="mt-4 text-[#9e8d7d] dark:text-[#7c6a76]">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#e6e2df] to-[#9e8d7d] dark:from-[#1a1618] dark:to-[#4d4349]">
      <div className="w-full max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/auth")}
          className="mb-4 text-[#161315] dark:text-[#f7f7f7] hover:bg-[#765567]/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

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
            Daftar
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-[#161315] dark:text-[#f7f7f7]"
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
                className="mt-1 block w-full px-4 py-3 bg-[#e6e2df]/70 dark:bg-[#1a1618]/70 border-0 rounded-xl text-[#161315] dark:text-[#f7f7f7] placeholder-[#9e8d7d] dark:placeholder-[#7c6a76] focus:ring-2 focus:ring-[#765567] focus:outline-none"
              />
            </div>

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

            <div>
              <Label className="text-sm font-medium text-[#161315] dark:text-[#f7f7f7] mb-3 block">
                Pilih Peran Anda
              </Label>
              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all duration-300 ${
                    role === "user"
                      ? "bg-[#765567]/20 border-2 border-[#765567]"
                      : "bg-[#e6e2df]/70 dark:bg-[#1a1618]/70 border-2 border-transparent hover:border-[#765567]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                    className="w-5 h-5 mt-0.5 text-[#765567] accent-[#765567]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-base text-[#161315] dark:text-[#f7f7f7] block">
                      Pengguna
                    </span>
                    <p className="text-xs text-[#9e8d7d] dark:text-[#7c6a76] mt-1">
                      Saya mencari dukungan kesehatan mental
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all duration-300 ${
                    role === "professional"
                      ? "bg-[#765567]/20 border-2 border-[#765567]"
                      : "bg-[#e6e2df]/70 dark:bg-[#1a1618]/70 border-2 border-transparent hover:border-[#765567]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="professional"
                    checked={role === "professional"}
                    onChange={() => setRole("professional")}
                    className="w-5 h-5 mt-0.5 text-[#765567] accent-[#765567]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-base text-[#161315] dark:text-[#f7f7f7] block">
                      Profesional
                    </span>
                    <p className="text-xs text-[#9e8d7d] dark:text-[#7c6a76] mt-1">
                      Saya adalah profesional kesehatan mental
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B6CFD] hover:bg-[#7A5CE8] py-3 text-lg font-semibold"
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
            <p className="text-sm text-[#9e8d7d] dark:text-[#7c6a76]">
              Sudah punya akun?{" "}
              <button
                onClick={() => router.push("/auth")}
                className="text-[#8B6CFD] hover:underline font-semibold"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
