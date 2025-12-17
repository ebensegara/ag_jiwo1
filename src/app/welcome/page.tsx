"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  ArrowRight,
  ChevronDown,
  Check,
  Shield,
  Clock,
  Star,
} from "lucide-react";

export default function WelcomePage() {
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d1d0cf] to-[#756657]">
      {/* ================================================
          HEADER - Glassmorphism Sticky Nav
          ================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? "bg-white/80 backdrop-blur-lg shadow-lg py-3"
            : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-11 h-11 bg-gradient-to-br from-[#C4AB9C] to-[#e67b5e] rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#3D3D3D] tracking-tight">
                Jiwo<span className="text-[#e67b5e]">.AI</span>
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-[#3D3D3D]/70 hover:text-[#3D3D3D] font-medium transition-colors"
              >
                Fitur
              </a>
              <a
                href="#holistic"
                className="text-[#3D3D3D]/70 hover:text-[#3D3D3D] font-medium transition-colors"
              >
                Perawatan
              </a>
              <a
                href="#pricing"
                className="text-[#3D3D3D]/70 hover:text-[#3D3D3D] font-medium transition-colors"
              >
                Harga
              </a>
            </nav>

            {/* Auth Buttons - Using Link */}
            <div className="flex items-center space-x-3">
              <Link href="/auth" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-[#3D3D3D] hover:bg-white/20 font-medium"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-[#3D3D3D] hover:bg-[#3D3D3D]/90 text-white font-medium px-6 shadow-lg">
                  Mulai Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================
          HERO SECTION
          ================================================ */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-white/50 rounded-full px-4 py-2 shadow-lg">
                <Sparkles className="w-4 h-4 text-[#e67b5e]" />
                <span className="text-sm font-medium text-[#3D3D3D]">
                  #1 Mental Wellness Platform di Indonesia
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#3D3D3D] leading-[1.1] tracking-tight">
                  Merawat Jiwa,
                  <br />
                  <span className="text-[#e67b5e]">Menemukan Damai</span>
                </h1>
                <p className="text-xl text-[#3D3D3D]/80 max-w-lg leading-relaxed">
                  Teman digital untuk kesehatan mental Anda. Kombinasi AI yang
                  memahami + akses ke profesional tersertifikasi, tersedia 24/7.
                </p>
              </div>

              {/* CTA Buttons - Using Link */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-[#e67b5e] hover:bg-[#d66b4e] text-white text-lg px-8 py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all group w-full sm:w-auto"
                  >
                    Mulai Perjalanan Anda
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-2 border-[#3D3D3D]/20 text-[#3D3D3D] hover:bg-white text-lg px-8 py-7 rounded-2xl w-full sm:w-auto"
                  >
                    Sudah Punya Akun
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C4AB9C] to-[#e67b5e] border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-[#3D3D3D]/80">
                    <strong className="text-[#3D3D3D]">10,000+</strong> pengguna
                    aktif
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#e67b5e] text-[#e67b5e]"
                    />
                  ))}
                  <span className="text-sm text-[#3D3D3D]/80 ml-1">
                    4.9/5 rating
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main Card */}
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-6">
                    {/* Chat Preview */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C4AB9C] to-[#e67b5e] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-[#F5F3F0] rounded-2xl rounded-tl-sm p-4 max-w-xs">
                        <p className="text-[#3D3D3D] text-sm">
                          Hai! Aku di sini untuk mendengarkan. Bagaimana
                          perasaanmu hari ini? 💚
                        </p>
                      </div>
                    </div>

                    {/* Mood Selector Preview */}
                    <div className="bg-[#F5F3F0]/80 rounded-2xl p-4">
                      <p className="text-xs text-[#3D3D3D]/60 mb-3">
                        Mood hari ini
                      </p>
                      <div className="flex justify-between">
                        {["😢", "😕", "😐", "🙂", "😊"].map((emoji, i) => (
                          <div
                            key={i}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${i === 4
                                ? "bg-[#C4AB9C] scale-110 shadow-lg"
                                : "bg-white"
                              }`}
                          >
                            {emoji}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats Preview */}
                    <div className="flex gap-4">
                      <div className="flex-1 bg-[#e67b5e]/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-[#e67b5e]">7</p>
                        <p className="text-xs text-[#3D3D3D]/60">Hari berturut</p>
                      </div>
                      <div className="flex-1 bg-[#C4AB9C]/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-[#C4AB9C]">85%</p>
                        <p className="text-xs text-[#3D3D3D]/60">Mood positif</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#3D3D3D]">
                        100% Privat
                      </p>
                      <p className="text-xs text-[#3D3D3D]/60">Data terenkripsi</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e67b5e]/10 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#e67b5e]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#3D3D3D]">24/7</p>
                      <p className="text-xs text-[#3D3D3D]/60">Selalu tersedia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:block">
            <button
              onClick={scrollToFeatures}
              className="flex flex-col items-center gap-2 text-[#3D3D3D]/60 hover:text-[#3D3D3D] transition-colors cursor-pointer"
            >
              <span className="text-xs font-medium">Scroll untuk explore</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================
          SOCIAL PROOF BAR
          ================================================ */}
      <section className="py-12 bg-white border-y border-[#C4AB9C]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-[#3D3D3D]/60 text-sm font-medium">
              Dipercaya oleh perusahaan terkemuka
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {["Gojek", "Tokopedia", "Telkom", "BCA", "Unilever"].map((company) => (
                <span
                  key={company}
                  className="text-xl font-bold text-[#3D3D3D]/20 hover:text-[#3D3D3D]/40 transition-colors cursor-default"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          FEATURES SECTION
          ================================================ */}
      <section
        id="features"
        ref={featuresRef}
        className="py-24 px-6 lg:px-8 bg-[#F5F3F0]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[#e67b5e] uppercase tracking-wider mb-4">
              Fitur Lengkap
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3D3D3D] mb-6">
              Semua yang Kamu Butuhkan
              <br />
              <span className="text-[#e67b5e]">dalam Satu Tempat</span>
            </h2>
            <p className="text-xl text-[#3D3D3D]/60 max-w-2xl mx-auto">
              Platform lengkap untuk perjalanan kesehatan mental Anda.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Chat - Large Card */}
            <div className="lg:col-span-2">
              <div className="h-full bg-gradient-to-br from-[#e67b5e] to-[#C4AB9C] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    AI Life Coach
                  </h3>
                  <p className="text-white/80 text-lg max-w-md mb-6">
                    Berbicara dengan AI yang empati dan memahami Anda kapan saja.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {["24/7 Tersedia", "Bahasa Indonesia", "Empati AI"].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-white/20 rounded-full text-sm text-white font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mood Tracking */}
            <div>
              <div className="h-full bg-[#DDBEA9] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="h-7 w-7 text-[#3D3D3D]" />
                </div>
                <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">Mood Tracking</h3>
                <p className="text-[#3D3D3D]/70">Pantau perubahan mood dan pahami pola emosi Anda.</p>
              </div>
            </div>

            {/* Journal */}
            <div>
              <div className="h-full bg-[#B7B7A4] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="h-7 w-7 text-[#3D3D3D]" />
                </div>
                <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">Jurnal Digital</h3>
                <p className="text-[#3D3D3D]/70">Tulis dan refleksikan perasaan Anda dengan jurnal aman.</p>
              </div>
            </div>

            {/* Self-Screening */}
            <div>
              <div className="h-full bg-[#C8BDAF] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center mb-6">
                  <ClipboardList className="h-7 w-7 text-[#3D3D3D]" />
                </div>
                <h3 className="text-2xl font-bold text-[#3D3D3D] mb-3">Self-Screening</h3>
                <p className="text-[#3D3D3D]/70">Tes kesehatan mental untuk memahami diri Anda.</p>
              </div>
            </div>

            {/* Insights */}
            <div className="md:col-span-2">
              <div className="h-full bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-[#C4AB9C]/20">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-14 h-14 bg-[#e67b5e]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-7 w-7 text-[#e67b5e]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#3D3D3D] mb-2">Weekly Insights dengan AI</h3>
                    <p className="text-[#3D3D3D]/70">Wawasan mendalam tentang perkembangan kesehatan mental Anda.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Access */}
            <div>
              <div className="h-full bg-[#3D3D3D] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-white">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Akses Profesional</h3>
                <p className="text-white/70 mb-4">Konsultasi dengan psikolog tersertifikasi.</p>
                <div className="flex items-center gap-2 text-[#C4AB9C]">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          HOLISTIC CARE SECTION
          ================================================ */}
      <section id="holistic" className="py-24 px-6 lg:px-8 bg-[#E8DDD2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[#e67b5e] uppercase tracking-wider mb-4">
              Perawatan Holistik
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3D3D3D] mb-6">
              Lebih dari Sekadar
              <br />
              <span className="text-[#e67b5e]">Kesehatan Mental</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Yoga", desc: "Keseimbangan tubuh dan pikiran", bg: "from-[#CB997E] to-[#B7846D]" },
              { icon: Flower2, title: "Meditasi", desc: "Relaksasi dan ketenangan", bg: "from-[#B7B7A4] to-[#A5A594]" },
              { icon: Palette, title: "Art Therapy", desc: "Penyembuhan melalui seni", bg: "from-[#A5A58D] to-[#8F8F7A]" },
              { icon: Brain, title: "Mindfulness", desc: "Mengatasi stres dan kecemasan", bg: "from-[#6B705C] to-[#5A5F4E]" },
            ].map((item) => (
              <div key={item.title}>
                <div className={`h-full bg-gradient-to-br ${item.bg} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 text-center group`}>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          CTA / PRICING SECTION
          ================================================ */}
      <section id="pricing" className="py-24 px-6 lg:px-8 bg-[#3D3D3D] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#e67b5e]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C4AB9C]/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Siap Memulai
            <br />
            <span className="text-[#C4AB9C]">Perjalanan Anda?</span>
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan orang yang telah menemukan ketenangan.
          </p>

          {/* Pricing Cards */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
            {/* Free Plan */}
            <div className="flex-1 max-w-xs mx-auto sm:mx-0 bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-left">
              <h3 className="text-xl font-bold text-white mb-2">Gratis</h3>
              <p className="text-3xl font-bold text-white mb-4">
                Rp 0<span className="text-lg font-normal text-white/60">/bulan</span>
              </p>
              <ul className="space-y-3 mb-6">
                {["5 chat AI/hari", "Mood tracking", "Self-screening"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/80">
                    <Check className="w-4 h-4 text-[#C4AB9C]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Mulai Gratis
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="flex-1 max-w-xs mx-auto sm:mx-0 bg-gradient-to-br from-[#e67b5e] to-[#C4AB9C] rounded-3xl p-8 text-left relative shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#e67b5e] text-xs font-bold px-3 py-1 rounded-full">
                POPULER
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
              <p className="text-3xl font-bold text-white mb-4">
                Rp 99K<span className="text-lg font-normal text-white/80">/bulan</span>
              </p>
              <ul className="space-y-3 mb-6">
                {["Unlimited AI chat", "Semua fitur gratis", "Weekly insights AI", "Akses profesional"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white">
                    <Check className="w-4 h-4" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button className="w-full bg-white text-[#e67b5e] hover:bg-white/90 font-semibold">
                  Daftar Premium
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-white/50 text-sm">
            Tidak perlu kartu kredit untuk memulai.
          </p>
        </div>
      </section>

      {/* ================================================
          FOOTER
          ================================================ */}
      <footer className="py-16 px-6 lg:px-8 bg-[#F5F3F0] border-t border-[#C4AB9C]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C4AB9C] to-[#e67b5e] rounded-xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#3D3D3D]">
                Jiwo<span className="text-[#e67b5e]">.AI</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8">
              <a href="#" className="text-[#3D3D3D]/60 hover:text-[#3D3D3D] transition-colors">Tentang Kami</a>
              <a href="#" className="text-[#3D3D3D]/60 hover:text-[#3D3D3D] transition-colors">Kebijakan Privasi</a>
              <a href="#" className="text-[#3D3D3D]/60 hover:text-[#3D3D3D] transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="text-[#3D3D3D]/60 hover:text-[#3D3D3D] transition-colors">Kontak</a>
            </div>

            <p className="text-[#3D3D3D]/50 text-sm">
              © 2024 Jiwo.AI. Kesehatan mental untuk semua.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
