"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, AlertTriangle, Phone, MessageCircle, RotateCcw, BookOpen, Sparkles, ChevronDown } from "lucide-react";
import { getSafeUser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IciResponse {
  success?: boolean;
  crisis?: boolean;
  journal_id?: string;
  ici_response?: string;
  emotion_tags?: string[];
  core_theme?: string;
  summary_1_sentence?: string;
  intent?: string;
  risk_level?: number;
  saved_memories?: string[];
  related_past_entry?: { summary: string; date: string; similarity: number } | null;
  suggest_napin?: boolean;
  message?: string;
}

// ─── Mood Config ─────────────────────────────────────────────────────────────

const MOODS = [
  { score: 1, emoji: "😭", label: "Berat banget", color: "#DC2626" },
  { score: 2, emoji: "😞", label: "Kurang baik", color: "#D97706" },
  { score: 3, emoji: "😐", label: "Biasa aja", color: "#6B7280" },
  { score: 4, emoji: "🙂", label: "Lumayan baik", color: "#059669" },
  { score: 5, emoji: "😄", label: "Luar biasa!", color: "#7C3AED" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const INTENT_LABEL: Record<string, string> = {
  venting: "Curhat",
  problem_solving: "Cari solusi",
  gratitude: "Bersyukur",
  crisis: "Butuh bantuan",
};

const INTENT_COLOR: Record<string, string> = {
  venting: "#D97706",
  problem_solving: "#2563EB",
  gratitude: "#059669",
  crisis: "#DC2626",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [q1, setQ1] = useState(""); // perasaan di badan/hati
  const [q2, setQ2] = useState(""); // kejadian/pikiran
  const [q3, setQ3] = useState(""); // ketakutan terburuk
  const [moodScore, setMoodScore] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IciResponse | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const combinedText = [
    q1 && `Perasaan: ${q1}`,
    q2 && `Kejadian: ${q2}`,
    q3 && `Ketakutan: ${q3}`,
  ].filter(Boolean).join(". ");

  const canSubmit = (q1.trim().length > 3 || q2.trim().length > 3) && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);

    try {
      const user = await getSafeUser();
      if (!user) { window.location.href = "/auth"; return; }

      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_text: combinedText,
          mood_score: moodScore,
          user_id: user.id,
        }),
      });

      const data: IciResponse = await res.json();
      setResult(data);

      // Scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    } catch (err: any) {
      toast({ title: "Gagal kirim jurnal", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setQ1(""); setQ2(""); setQ3("");
    setMoodScore(3);
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const user = await getSafeUser();
      if (!user) return;
      const res = await fetch(`/api/journal?userId=${user.id}`);
      const data = await res.json();
      setHistory(data.entries || []);
      setShowHistory(true);
    } catch {
      toast({ title: "Gagal memuat riwayat", variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectedMood = MOODS.find(m => m.score === moodScore)!;

  return (
    <div className="min-h-screen" style={{ background: "#F6F4F1", fontFamily: "Inter, sans-serif" }}>

      {/* Top Bar */}
      <div className="sticky top-0 z-20 border-b px-4 md:px-6 py-3 flex items-center justify-between"
        style={{ background: "#FDFCFB", borderColor: "#E5E0DA", boxShadow: "0 1px 4px rgba(117,102,87,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity" style={{ color: "#7A726B" }}>
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </Link>
          <div className="w-px h-5" style={{ background: "#E5E0DA" }} />
          <Image src="/images/jiwo-logo.png" alt="Jiwo.AI" width={80} height={32} className="object-contain" />
        </div>
        <button onClick={loadHistory} disabled={loadingHistory}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
          style={{ background: "#F5ECE8", color: "#785438" }}>
          {loadingHistory ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />}
          Riwayat
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">

        {/* Header */}
        {!result && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ background: "#F5ECE8", border: "2px solid #E5D5C5" }}>
              🤍
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Ceritain ke Ici
            </h1>
            <p className="text-sm" style={{ color: "#7A726B" }}>
              Tulis aja yang ada di kepala. Ici dengerin & inget. Nggak bakal nge-judge.
            </p>
          </div>
        )}

        {/* ─── INPUT FORM ─────────────────────────────────────────────── */}
        {!result && (
          <div className="space-y-5">

            {/* Q1 */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#FDFCFB", borderColor: "#E5E0DA" }}>
              <div className="px-4 pt-4 pb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#785438" }}>
                  💭 Apa yang paling kenceng kerasa di badan/hati hari ini?
                </label>
                <p className="text-xs mt-0.5" style={{ color: "#9A8F87" }}>
                  Nggak tau namanya? Tulis aja "nggak enak" gapapa.
                </p>
              </div>
              <textarea
                value={q1}
                onChange={e => setQ1(e.target.value)}
                placeholder="Contoh: Dada sesek, atau lega banget abis nangis..."
                rows={3}
                className="w-full px-4 pb-4 text-sm resize-none outline-none"
                style={{ background: "transparent", color: "#3A332C" }}
              />
            </div>

            {/* Q2 */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#FDFCFB", borderColor: "#E5E0DA" }}>
              <div className="px-4 pt-4 pb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#785438" }}>
                  ⚡ Kejadian atau pikiran apa yang bikin gitu?
                </label>
                <p className="text-xs mt-0.5" style={{ color: "#9A8F87" }}>
                  Makin spesifik makin bagus. "Dimarahin bos Budi soal laporan" &gt; "kerjaan"
                </p>
              </div>
              <textarea
                value={q2}
                onChange={e => setQ2(e.target.value)}
                placeholder="Contoh: Besok disuruh presentasi depan bos..."
                rows={3}
                className="w-full px-4 pb-4 text-sm resize-none outline-none"
                style={{ background: "transparent", color: "#3A332C" }}
              />
            </div>

            {/* Q3 — Optional */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#FDFCFB", borderColor: "#E5E0DA" }}>
              <div className="px-4 pt-4 pb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#785438" }}>
                  😨 Kalau dibiarin, kamu takutnya bakal gimana? <span style={{ color: "#9A8F87", fontWeight: 400 }}>(opsional)</span>
                </label>
                <p className="text-xs mt-0.5" style={{ color: "#9A8F87" }}>
                  Ini bantu Ici bedain cemas biasa vs katastrofik. Skip kalau lagi seneng.
                </p>
              </div>
              <textarea
                value={q3}
                onChange={e => setQ3(e.target.value)}
                placeholder="Contoh: Takut dipecat, takut malu di depan semua orang..."
                rows={2}
                className="w-full px-4 pb-4 text-sm resize-none outline-none"
                style={{ background: "transparent", color: "#3A332C" }}
              />
            </div>

            {/* Mood Picker */}
            <div className="rounded-2xl border p-4" style={{ background: "#FDFCFB", borderColor: "#E5E0DA" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#785438" }}>
                🌡️ Mood hari ini
              </p>
              <div className="flex justify-between gap-2">
                {MOODS.map(mood => (
                  <button key={mood.score} onClick={() => setMoodScore(mood.score)}
                    className="flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: moodScore === mood.score ? mood.color : "#E5E0DA",
                      background: moodScore === mood.score ? `${mood.color}15` : "transparent",
                      transform: moodScore === mood.score ? "scale(1.08)" : "scale(1)",
                    }}>
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs mt-1 font-medium hidden sm:block"
                      style={{ color: moodScore === mood.score ? mood.color : "#9A8F87" }}>
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!canSubmit}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: canSubmit ? "linear-gradient(135deg, #785438, #9B6B45)" : "#D4C5BA",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 4px 20px rgba(120,84,56,0.3)" : "none",
              }}>
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Ici lagi baca jurnal kamu...</>
              ) : (
                <><Send className="w-4 h-4" /> Kasih ke Ici</>
              )}
            </button>

            {!canSubmit && !loading && (
              <p className="text-center text-xs" style={{ color: "#9A8F87" }}>
                Isi minimal satu pertanyaan dulu ya 😊
              </p>
            )}
          </div>
        )}

        {/* ─── RESULT: CRISIS ─────────────────────────────────────────── */}
        {result?.crisis && (
          <div ref={resultRef} className="rounded-3xl border-2 p-6 text-center" style={{ background: "#FFF5F5", borderColor: "#FECACA" }}>
            <div className="text-4xl mb-3">🤍</div>
            <p className="font-bold text-lg mb-2" style={{ color: "#DC2626" }}>Ici ada di sini</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#3A332C" }}>{result.message}</p>
            <div className="flex flex-col gap-3">
              <a href="tel:119" className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-white"
                style={{ background: "#DC2626" }}>
                <Phone className="w-4 h-4" /> Telepon 119 ext 8 (gratis 24 jam)
              </a>
              <Link href="/dashboard">
                <button className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold w-full"
                  style={{ background: "#F5ECE8", color: "#785438" }}>
                  <MessageCircle className="w-4 h-4" /> Chat dengan Jiwo sekarang
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ─── RESULT: ICI RESPONSE ───────────────────────────────────── */}
        {result?.success && (
          <div ref={resultRef} className="space-y-4">

            {/* Ici Reply Card */}
            <div className="rounded-3xl border p-5" style={{ background: "#FDFCFB", borderColor: "#E5E0DA", boxShadow: "0 2px 16px rgba(117,102,87,0.08)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: "#F5ECE8" }}>
                  🤍
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#785438" }}>Ici</p>
                  <p className="text-xs" style={{ color: "#9A8F87" }}>barusan baca jurnalmu</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#3A332C" }}>{result.ici_response}</p>
            </div>

            {/* Emotion Tags + Intent */}
            <div className="rounded-2xl border p-4 flex flex-wrap gap-2 items-center" style={{ background: "#FDFCFB", borderColor: "#E5E0DA" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#785438" }} />
              {result.emotion_tags?.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "#F5ECE8", color: "#785438" }}>
                  {tag}
                </span>
              ))}
              {result.intent && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium ml-auto"
                  style={{ background: `${INTENT_COLOR[result.intent]}15`, color: INTENT_COLOR[result.intent] }}>
                  {INTENT_LABEL[result.intent]}
                </span>
              )}
            </div>

            {/* Related past journal */}
            {result.related_past_entry && (
              <div className="rounded-2xl border p-4" style={{ background: "#F0F7FF", borderColor: "#BFDBFE" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "#2563EB" }}>🔗 Nyambung sama jurnal lama</p>
                <p className="text-sm" style={{ color: "#1E40AF" }}>{result.related_past_entry.summary}</p>
                <p className="text-xs mt-1" style={{ color: "#93C5FD" }}>
                  {new Date(result.related_past_entry.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{Math.round(result.related_past_entry.similarity * 100)}% relevan
                </p>
              </div>
            )}

            {/* Saved memories */}
            {result.saved_memories && result.saved_memories.length > 0 && (
              <div className="rounded-2xl border p-4" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#059669" }}>🧠 Ici udah inget ini dari jurnalmu:</p>
                <ul className="space-y-1">
                  {result.saved_memories.map((m, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: "#065F46" }}>
                      <span>•</span><span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggest Napin */}
            {result.suggest_napin && (
              <div className="rounded-2xl border p-4 text-center" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
                <p className="text-sm font-semibold mb-3" style={{ color: "#7C3AED" }}>
                  Mau napin 1 menit bareng Ici? 🌸
                </p>
                <Link href="/dashboard?tool=breathe">
                  <button className="px-6 py-2.5 rounded-xl font-medium text-white text-sm"
                    style={{ background: "#7C3AED" }}>
                    Yuk napin bareng
                  </button>
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
                style={{ background: "#F5ECE8", color: "#785438" }}>
                <RotateCcw className="w-4 h-4" /> Tulis lagi
              </button>
              <Link href="/memories" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
                  style={{ background: "#FDFCFB", color: "#7A726B", border: "1px solid #E5E0DA" }}>
                  Lihat memori →
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ─── HISTORY ─────────────────────────────────────────────────── */}
        {showHistory && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Riwayat Jurnal
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-xs" style={{ color: "#7A726B" }}>
                Tutup
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: "#9A8F87" }}>Belum ada jurnal tersimpan.</p>
            ) : (
              <div className="space-y-3">
                {history.map(entry => {
                  const mood = MOODS.find(m => m.score === entry.mood_score);
                  return (
                    <div key={entry.id} className="rounded-2xl border p-4" style={{ background: "#FDFCFB", borderColor: "#E5E0DA" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mood?.emoji || "📝"}</span>
                          <span className="text-xs font-semibold" style={{ color: "#3A332C" }}>
                            {entry.core_theme || "Jurnal"}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: "#9A8F87" }}>
                          {new Date(entry.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#7A726B" }}>
                        {entry.summary_1_sentence || entry.ici_response?.substring(0, 100) + "..."}
                      </p>
                      {entry.emotion_tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.emotion_tags.map((t: string) => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "#F5ECE8", color: "#785438" }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
