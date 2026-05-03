"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Loader2, Mic, MicOff, Volume2, Settings, CloudRain, Brain, CheckCircle2, Circle, Flame, BarChart2, Map, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const JournalModal = dynamic(() => import("@/components/wellness-modals/journal-modal"), { ssr: false });
const BreatheModal = dynamic(() => import("@/components/wellness-modals/breathe-modal"), { ssr: false });
const VisualizeModal = dynamic(() => import("@/components/wellness-modals/visualize-modal"), { ssr: false });

type VoiceState = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';
type ModalType = 'journal' | 'breathe' | 'visualize' | null;

const MOODS = [
  { score: 1, emoji: "😔", label: "Sangat Buruk" },
  { score: 2, emoji: "😕", label: "Buruk" },
  { score: 3, emoji: "😐", label: "Biasa" },
  { score: 4, emoji: "🙂", label: "Baik" },
  { score: 5, emoji: "😄", label: "Luar Biasa" },
];

const WEEK_MOODS = [3, 4, 2, 5, 3, 4, 3]; // Mon–Sun sample data
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const MEMORIES = [
  { icon: "🎯", text: "Suka musik saat stres" },
  { icon: "😰", text: "Overthinking malam hari" },
  { icon: "💪", text: "Berhasil napas 4-7-8" },
];

const ACTIVITIES = [
  { label: "Morning check-in", done: true },
  { label: "Journal entry", done: true },
  { label: "Sesi napas (0/1)", done: false },
  { label: "Visualisasi (0/1)", done: false },
];

const TOOLS = [
  { key: "breathe", emoji: "🌬️", title: "Napas & Relaksasi", desc: "Teknik 4-7-8, Box Breathing", bg: "bg-green-50 border-green-100", btn: "Mulai", modal: "breathe" as ModalType },
  { key: "journal", emoji: "📓", title: "Journal", desc: "Cerita ke Jiwo, bebas tanpa judgment", bg: "bg-amber-50 border-amber-100", btn: "Tulis", modal: "journal" as ModalType },
  { key: "visualize", emoji: "🌅", title: "Visualisasi", desc: "Pantai, Pegunungan, Hutan, Bintang", bg: "bg-pink-50 border-pink-100", btn: "Eksplorasi", modal: "visualize" as ModalType },
  { key: "learn", emoji: "📚", title: "Belajar", desc: "Kenali panic attack & anxiety", bg: "bg-blue-50 border-blue-100", btn: null, modal: null },
  { key: "play", emoji: "🎮", title: "Main", desc: "Mini-games untuk alihkan fokus", bg: "bg-purple-50 border-purple-100", btn: null, modal: null },
  { key: "sleep", emoji: "🌙", title: "Tidur", desc: "Soundscape & cerita pengantar tidur", bg: "bg-indigo-50 border-indigo-100", btn: null, modal: null },
];

export default function WellnessDashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [allowProactive, setAllowProactive] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [isPanicking, setIsPanicking] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [showNightDump, setShowNightDump] = useState(false);
  const [nightDumpText, setNightDumpText] = useState("");
  const [nightDumpDone, setNightDumpDone] = useState(false);
  const [isSubmittingND, setIsSubmittingND] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const h = new Date().getHours();
    setShowNightDump(h >= 21 && h < 23);
    getSafeUser().then(u => {
      if (!u) return;
      setUserId(u.id);
      supabase.from("user_preferences").select("allow_proactive_greeting").eq("user_id", u.id).maybeSingle().then(({ data }) => {
        const allowed = data ? data.allow_proactive_greeting : true;
        setAllowProactive(allowed);
        if (!data) supabase.from("user_preferences").insert({ user_id: u.id, allow_proactive_greeting: true }).then(() => {});
        if (allowed && !hasGreeted) { setHasGreeted(true); greet(u.id); }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = async (text: string) => {
    try {
      const r = await fetch("/api/voice/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, voice_id: "female_1" }) });
      const d = await r.json();
      if (d.audioBase64) {
        const blob = new Blob([Uint8Array.from(atob(d.audioBase64), c => c.charCodeAt(0))], { type: d.mimeType || "audio/mpeg" });
        const audio = new Audio(URL.createObjectURL(blob));
        setVoiceState("speaking");
        audio.onended = () => setVoiceState("idle");
        audio.play(); return;
      }
    } catch { }
    const u = new SpeechSynthesisUtterance(text); u.lang = "id-ID";
    u.onend = () => setVoiceState("idle"); setVoiceState("speaking");
    window.speechSynthesis.speak(u);
  };

  const greet = async (uid: string) => {
    try {
      const r = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "Sapa aku singkat, hangat, sebagai Jiwo.", userId: uid }) });
      const d = await r.json();
      if (d.text) { toast({ title: "👋 Jiwo Menyapa", description: d.text, duration: 8000 }); speak(d.text); }
    } catch { }
  };

  const handlePanic = async () => {
    if (!userId) return; setIsPanicking(true);
    try {
      const d = await (await fetch("/api/panic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) })).json();
      if (d.text) { toast({ title: "🌬️ Jiwo di sini", description: d.text, duration: 15000 }); speak(d.text); }
    } catch { } finally { setIsPanicking(false); }
  };

  const handleVoiceNote = async () => {
    if (voiceState === "recording") { mediaRecorderRef.current?.stop(); return; }
    if (voiceState !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream); mediaRecorderRef.current = mr; audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop()); setVoiceState("transcribing");
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const fd = new FormData(); fd.append("audio", blob, "voice.webm");
        try {
          const tr = await (await fetch("/api/voice/transcribe", { method: "POST", body: fd })).json();
          if (!tr.text) throw new Error("Gagal transkripsi");
          setVoiceTranscript(tr.text); setVoiceState("thinking");
          const ag = await (await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: tr.text, userId }) })).json();
          toast({ title: `🎙️ "${tr.text.substring(0, 40)}..."`, description: ag.text, duration: 10000 });
          speak(ag.text);
        } catch (e: any) { setVoiceState("idle"); toast({ title: "Error", description: e.message, variant: "destructive" }); }
      };
      mr.start(); setVoiceState("recording");
    } catch (e: any) { toast({ title: "Mic Error", description: e.message, variant: "destructive" }); }
  };

  const handleSaveMood = async () => {
    if (!selectedMood || !userId) return;
    await supabase.from("moods").insert({ user_id: userId, score: selectedMood });
    setMoodSaved(true);
    toast({ title: "✅ Mood tersimpan!", description: `Mood hari ini: ${MOODS[selectedMood - 1].emoji} ${MOODS[selectedMood - 1].label}` });
  };

  const handleNightDump = async () => {
    if (!nightDumpText.trim() || !userId) return; setIsSubmittingND(true);
    try {
      await fetch("/api/rituals/trigger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, ritualType: "night_dump", content: nightDumpText }) });
      const ag = await (await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `Night dump: ${nightDumpText}`, userId }) })).json();
      setNightDumpDone(true); setNightDumpText("");
      toast({ title: "🌙 Sampah otak dibuang!", description: ag.text, duration: 12000 });
      if (ag.text) speak(ag.text);
    } catch { } finally { setIsSubmittingND(false); }
  };

  const voiceCfg = {
    idle: { icon: Mic, label: "Cerita ke Jiwo", cls: "bg-violet-500 hover:bg-violet-600" },
    recording: { icon: MicOff, label: "Stop...", cls: "bg-red-500 animate-pulse" },
    transcribing: { icon: Loader2, label: "Transkripsi...", cls: "bg-gray-400" },
    thinking: { icon: Loader2, label: "Jiwo berpikir...", cls: "bg-amber-400" },
    speaking: { icon: Volume2, label: "Jiwo ngomong...", cls: "bg-green-500 animate-pulse" },
  }[voiceState];

  const maxMood = Math.max(...WEEK_MOODS);

  return (
    <div className="min-h-screen" style={{ background: "#F6F4F1", fontFamily: "Inter, sans-serif" }}>
      {/* Modals */}
      {activeModal === "journal" && <JournalModal onClose={() => setActiveModal(null)} />}
      {activeModal === "breathe" && <BreatheModal onClose={() => setActiveModal(null)} />}
      {activeModal === "visualize" && <VisualizeModal onClose={() => setActiveModal(null)} />}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: "#FDFCFB", borderColor: "#E5E0DA" }}>
        <div>
        <Image src="/images/jiwo-logo.png" alt="Jiwo.AI" width={130} height={52} className="object-contain" priority />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: "#7A726B" }}>
            <span>Jiwo nyapa duluan</span>
            <Switch checked={allowProactive} onCheckedChange={v => { setAllowProactive(v); if (userId && v) greet(userId); }} />
          </div>
          <Link href="/settings">
            <button className="p-2 rounded-xl hover:bg-gray-100" style={{ color: "#7A726B" }}><Settings className="w-5 h-5" /></button>
          </Link>
        </div>
      </div>

      <div className="flex gap-0">
        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Greeting */}
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {new Date().getHours() < 12 ? "Selamat Pagi" : new Date().getHours() < 17 ? "Selamat Siang" : "Selamat Malam"}, Ran! {new Date().getHours() < 17 ? "🌤️" : "🌙"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "#7A726B" }}>Bagaimana perasaanmu hari ini?</p>
          </div>

          {/* Panic + Voice */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={handlePanic} disabled={isPanicking}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #e53e3e, #c53030)", boxShadow: "0 4px 20px rgba(229,62,62,0.35)" }}>
              {isPanicking ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
              {isPanicking ? "Menenangkan..." : "🚨 Panic Relief"}
            </button>
            <button onClick={handleVoiceNote} disabled={voiceState === "transcribing" || voiceState === "thinking"}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold shadow-lg transition-all hover:scale-105 ${voiceCfg.cls}`}>
              <voiceCfg.icon className={`w-5 h-5 ${voiceState === "transcribing" || voiceState === "thinking" ? "animate-spin" : ""}`} />
              🎙️ {voiceCfg.label}
            </button>
          </div>
          {voiceTranscript && voiceState !== "idle" && <p className="text-sm italic" style={{ color: "#7A726B" }}>"{voiceTranscript}"</p>}

          {/* Mood Check-in */}
          <div className="rounded-2xl p-5 border" style={{ background: "linear-gradient(135deg, #FFF8F5, #FFF3EE)", borderColor: "#E5E0DA", boxShadow: "0 2px 8px rgba(117,102,87,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📊</span>
              <h3 className="font-bold text-base" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Check-in Harian</h3>
            </div>
            {moodSaved ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">{MOODS[(selectedMood ?? 3) - 1].emoji}</p>
                <p className="font-semibold" style={{ color: "#785438" }}>Mood tersimpan! {MOODS[(selectedMood ?? 3) - 1].label} ✅</p>
              </div>
            ) : (
              <>
                <div className="flex justify-around mb-4">
                  {MOODS.map(m => (
                    <button key={m.score} onClick={() => setSelectedMood(m.score)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:scale-110"
                      style={{ background: selectedMood === m.score ? "rgba(120,84,56,0.12)" : "transparent", outline: selectedMood === m.score ? "2px solid #785438" : "none", outlineOffset: "2px" }}>
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-xs" style={{ color: "#7A726B" }}>{m.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={handleSaveMood} disabled={!selectedMood}
                  className="w-full py-2.5 rounded-full font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
                  style={{ background: "#785438" }}>
                  Simpan Mood
                </button>
              </>
            )}
          </div>

          {/* Night Dump */}
          {showNightDump && (
            <div className="rounded-2xl p-5 border-2" style={{ background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)", borderColor: "#C7D2FE" }}>
              {nightDumpDone ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-4xl">✨</p>
                  <p className="font-semibold" style={{ color: "#4338CA" }}>Sampah otak berhasil dibuang!</p>
                  <p className="text-sm" style={{ color: "#7A726B" }}>Tidur nyenyak ya 🌙</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg" style={{ color: "#4338CA" }}>🌙 Night Dump</h3>
                  <p className="text-sm" style={{ color: "#7A726B" }}>Mau cerita apa yang masih kepikiran?</p>
                  <Textarea value={nightDumpText} onChange={e => setNightDumpText(e.target.value)} placeholder="Tulis apapun..." className="resize-none border-indigo-200 bg-white/70" rows={3} />
                  <button onClick={handleNightDump} disabled={!nightDumpText.trim() || isSubmittingND}
                    className="w-full py-2.5 rounded-xl font-semibold text-white disabled:opacity-40"
                    style={{ background: "#4338CA" }}>
                    {isSubmittingND ? "Memproses..." : "Buang Sampah Otak 🗑️"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Wellness Tools Grid */}
          <div>
            <h3 className="font-bold mb-3" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Aktivitas Wellness</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TOOLS.map(t => (
                <div key={t.key} className={`rounded-2xl p-4 border ${t.bg} transition-all hover:shadow-md ${t.modal ? "cursor-pointer hover:-translate-y-0.5" : "opacity-70"}`}
                  onClick={() => t.modal && setActiveModal(t.modal)}>
                  <div className="text-2xl mb-2">{t.emoji}</div>
                  <h4 className="font-bold text-sm mb-1" style={{ color: "#3A332C" }}>{t.title}</h4>
                  <p className="text-xs mb-3" style={{ color: "#7A726B" }}>{t.desc}</p>
                  {t.btn ? (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: "#785438" }}>{t.btn}</span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#E5E0DA", color: "#7A726B" }}>Segera hadir</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Journey + Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg, #FFD3BA, #FF9A76)" }}>
              <div><p className="font-bold text-lg" style={{ color: "#3A332C" }}>My Journey</p><p className="text-sm opacity-80" style={{ color: "#3A332C" }}>Lihat progress</p></div>
              <Map className="w-10 h-10 opacity-40" />
            </div>
            <div className="rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg, #B8C9E3, #7A9CC6)" }}>
              <div><p className="font-bold text-lg" style={{ color: "#1E293B" }}>My Stats</p><p className="text-sm opacity-80" style={{ color: "#1E293B" }}>Analisis mingguan</p></div>
              <BarChart2 className="w-10 h-10 opacity-40" />
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside className="w-80 p-4 space-y-4 border-l hidden lg:block" style={{ borderColor: "#E5E0DA", background: "#FDFCFB" }}>

          {/* Jiwo Memory */}
          <div className="rounded-2xl p-4 border" style={{ borderColor: "#E5E0DA", boxShadow: "0 2px 8px rgba(117,102,87,0.06)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4" style={{ color: "#785438" }} />
              <h4 className="font-bold text-sm" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Jiwo Memory</h4>
            </div>
            <div className="space-y-2">
              {MEMORIES.map((m, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs" style={{ background: "#F5ECE8", color: "#3A332C" }}>
                  <span>{m.icon}</span><span>{m.text}</span>
                </div>
              ))}
            </div>
            <Link href="/memories"><p className="text-xs mt-3 hover:underline cursor-pointer" style={{ color: "#785438" }}>Lihat semua memori →</p></Link>
          </div>

          {/* Aktivitas Hari Ini */}
          <div className="rounded-2xl p-4 border" style={{ borderColor: "#E5E0DA", boxShadow: "0 2px 8px rgba(117,102,87,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Aktivitas Hari Ini</h4>
              <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "#FFF3EE", color: "#785438" }}>
                <Flame className="w-3 h-3" /> 12 hari
              </div>
            </div>
            <div className="space-y-2">
              {ACTIVITIES.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {a.done ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#7FB89E" }} /> : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: "#E5E0DA" }} />}
                  <span style={{ color: a.done ? "#3A332C" : "#7A726B" }}>{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Chart Mingguan */}
          <div className="rounded-2xl p-4 border" style={{ borderColor: "#E5E0DA", boxShadow: "0 2px 8px rgba(117,102,87,0.06)" }}>
            <h4 className="font-bold text-sm mb-3" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Mood Minggu Ini</h4>
            <div className="flex items-end justify-between gap-1 h-20">
              {WEEK_MOODS.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${(v / maxMood) * 64}px`, background: i === 6 ? "#785438" : "#E5D5C5" }} />
                  <span className="text-xs" style={{ color: "#7A726B" }}>{DAYS[i]}</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: "#7A726B" }}>Rata-rata: ⭐ 3.4/5</p>
          </div>

          {/* Voice Note CTA */}
          <button onClick={handleVoiceNote} disabled={voiceState !== "idle"}
            className="w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
            🎙️ Cerita ke Jiwo
          </button>
        </aside>
      </div>
    </div>
  );
}
