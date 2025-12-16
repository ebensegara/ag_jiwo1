"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  BookOpen,
  Heart,
  ClipboardList,
  TrendingUp,
  Users,
  Sparkles,
  Flower2,
  Palette,
  Brain,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#C4AB9C]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#C4AB9C] rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#3D3D3D]">Jiwo.AI</span>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth")}
                className="text-[#3D3D3D] hover:bg-[#C4AB9C]/10"
              >
                Masuk
              </Button>
              <Button
                onClick={() => router.push("/auth/signup")}
                className="bg-[#C4AB9C] hover:bg-[#C4AB9C]/90 text-white"
              >
                Daftar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(https://liqwjrzrcpdwhvpqitvh.supabase.co/storage/v1/object/public/internal_app/hand4.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
              style={{ color: "#E8DDD2" }}
            >
              Merawat Jiwa
            </h1>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#e67b5e] mb-6">
              Temukan Ketenangan
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Teman digital sehari-hari untuk kesehatan mental. Kombinasi AI
              cerdas + akses professional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => router.push("/auth/signup")}
                className="bg-[#C4AB9C] hover:bg-[#C4AB9C]/90 text-white text-lg px-8 py-6 rounded-xl"
              >
                Mulai Sekarang
              </Button>
              <Button
                size="lg"
                //          variant="outline"
                onClick={() => router.push("/auth")}
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
              >
                Sudah Punya Akun
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Teman Curhat Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#e67b5e] mb-6">
            Teman Curhat Setiap Saat
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Berbicara dengan AI Life Coach yang memahami Anda, tersedia 24/7
            untuk mendengarkan, memberi dukungan, dan membantu Anda menemukan
            solusi. Privat, aman, dan selalu siap untuk Anda.
          </p>
        </div>
      </section>

      {/* Fitur Lengkap Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F3F0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#eb7454] mb-12 text-center">
            Fitur Lengkap untuk Kesejahteraanmu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Chat */}
            <div className="bg-[#FFE8D6] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#ed953e]/40 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">
                AI Chat
              </h3>
              <p className="text-gray-600">
                Berbicara dengan AI Life Coach yang empati dan memahami Anda
                kapan saja.
              </p>
            </div>

            {/* Journal */}
            <div className="bg-[#B7B7A4] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#E8DDD2]/40 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">
                Journal
              </h3>
              <p className="text-gray-600">
                Tulis dan refleksikan perasaan Anda setiap hari dengan jurnal
                digital yang aman.
              </p>
            </div>

            {/* Mood Tracking */}
            <div className="bg-[#DDBEA9] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#E8DDD2]/40 rounded-xl flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">
                Mood Tracking
              </h3>
              <p className="text-gray-600">
                Pantau perubahan mood Anda dan pahami pola emosi dengan lebih
                baik.
              </p>
            </div>

            {/* Self-Screening */}
            <div className="bg-[#C8BDAF] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#E8DDD2]/40 rounded-xl flex items-center justify-center mb-6">
                <ClipboardList className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">
                Self-Screening
              </h3>
              <p className="text-gray-600">
                Tes kesehatan mental untuk memahami kondisi Anda dengan lebih
                baik.
              </p>
            </div>

            {/* Insights */}
            <div className="bg-[#CEB797] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#E8DDD2]/40 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">
                Insights
              </h3>
              <p className="text-gray-600">
                Dapatkan wawasan mendalam tentang perkembangan kesehatan mental
                Anda.
              </p>
            </div>

            {/* Professional */}
            <div className="bg-[#A59E8D] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#E8DDD2]/40 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">
                Akses Professional
              </h3>
              <p className="text-gray-600">
                Akses ke psikolog dan konselor profesional tersertifikasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perawatan Holistik Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E8DDD2]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#eb7454] mb-12 text-center">
            Perawatan Holistik untuk Jiwa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Yoga */}
            <div className="bg-[#CB997E] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#C4AB9C]/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Sparkles className="h-8 w-8 text-[#3D3D3D]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Yoga</h3>
              <p className="text-white">
                Latihan yoga untuk keseimbangan tubuh dan pikiran.
              </p>
            </div>

            {/* Reiki */}
            <div className="bg-[#B7B7A4] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#C4AB9C]/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Flower2 className="h-8 w-8 text-[#3D3D3D]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Reiki</h3>
              <p className="text-white">
                Penyembuhan energi untuk relaksasi dan ketenangan.
              </p>
            </div>

            {/* Art Therapy */}
            <div className="bg-[#A5A58D] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#C4AB9C]/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Palette className="h-8 w-8 text-[#3D3D3D]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Art Therapy
              </h3>
              <p className="text-white">
                Ekspresikan diri melalui seni untuk penyembuhan emosional.
              </p>
            </div>

            {/* Hypnotherapy */}
            <div className="bg-[#6B705C] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#C4AB9C]/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Hypnotherapy
              </h3>
              <p className="text-white">
                Terapi hipnosis untuk mengatasi masalah bawah sadar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#C4AB9C]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Siap Memulai Perjalanan Anda?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Bergabunglah dengan ribuan orang yang telah menemukan ketenangan dan
            dukungan kesehatan mental mereka.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/auth/signup")}
            className="bg-white text-[#C4AB9C] hover:bg-gray-100 text-lg px-10 py-6 rounded-xl"
          >
            Daftar Gratis Sekarang
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#C4AB9C]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-[#C4AB9C] rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#3D3D3D]">Jiwo.AI</span>
            </div>
            <p className="text-gray-600 text-center md:text-right">
              © 2024 Jiwo.AI. Kesehatan mental untuk semua.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
