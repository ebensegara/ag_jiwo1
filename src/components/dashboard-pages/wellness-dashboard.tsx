"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    BookOpen, Wind, Gamepad2, PenTool, Sparkles, Moon,
    Map, BarChart2, AlertTriangle, Loader2, Mic, MicOff,
    Volume2, Settings, CloudRain, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy load heavy modals
const JournalModal = dynamic(() => import("@/components/wellness-modals/journal-modal"), { ssr: false });
const BreatheModal = dynamic(() => import("@/components/wellness-modals/breathe-modal"), { ssr: false });
const VisualizeModal = dynamic(() => import("@/components/wellness-modals/visualize-modal"), { ssr: false });

type VoiceState = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';
type ModalType = 'journal' | 'breathe' | 'visualize' | null;

export default function WellnessDashboard() {
    const [isPanicking, setIsPanicking] = useState(false);
    const [allowProactive, setAllowProactive] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [hasGreeted, setHasGreeted] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Voice state
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Night dump
    const [showNightDump, setShowNightDump] = useState(false);
    const [nightDumpText, setNightDumpText] = useState('');
    const [isSubmittingNightDump, setIsSubmittingNightDump] = useState(false);
    const [nightDumpDone, setNightDumpDone] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        const hour = new Date().getHours();
        setShowNightDump(hour >= 21 && hour < 23);
    }, []);

    const triggerProactiveGreeting = async (uid: string) => {
        try {
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: "Sapa aku dengan singkat, ramah, dan hangat sebagai Jiwo karena aku baru membuka aplikasi.", userId: uid })
            });
            const data = await response.json();
            if (data.success && data.text) {
                toast({ title: "👋 Jiwo Menyapa", description: data.text, duration: 8000 });
                speakText(data.text);
            }
        } catch (error) { console.error("Proactive greeting error:", error); }
    };

    useEffect(() => {
        const init = async () => {
            const user = await getSafeUser();
            if (user) {
                setUserId(user.id);
                const { data } = await supabase
                    .from('user_preferences')
                    .select('allow_proactive_greeting')
                    .eq('user_id', user.id)
                    .maybeSingle();
                const isAllowed = data ? data.allow_proactive_greeting : true;
                if (data) setAllowProactive(data.allow_proactive_greeting);
                else {
                    try { await supabase.from('user_preferences').insert({ user_id: user.id, allow_proactive_greeting: true }); } catch { }
                }
                if (isAllowed && !hasGreeted) { setHasGreeted(true); triggerProactiveGreeting(user.id); }
            }
        };
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const speakText = async (text: string) => {
        try {
            const res = await fetch('/api/voice/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice_id: 'female_1' }) });
            const data = await res.json();
            if (data.audioBase64) {
                const audioBlob = new Blob([Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0))], { type: data.mimeType || 'audio/mpeg' });
                const audio = new Audio(URL.createObjectURL(audioBlob));
                setVoiceState('speaking');
                audio.onended = () => setVoiceState('idle');
                audio.play();
                return;
            }
        } catch { }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID";
        utterance.onend = () => setVoiceState('idle');
        setVoiceState('speaking');
        window.speechSynthesis.speak(utterance);
    };

    const handleVoiceNote = async () => {
        if (voiceState === 'recording') { mediaRecorderRef.current?.stop(); return; }
        if (voiceState !== 'idle') return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                setVoiceState('transcribing');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'voice.webm');
                try {
                    const tr = await (await fetch('/api/voice/transcribe', { method: 'POST', body: formData })).json();
                    if (!tr.text) throw new Error('Transcription failed');
                    setVoiceTranscript(tr.text);
                    setVoiceState('thinking');
                    const ag = await (await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: tr.text, userId }) })).json();
                    if (!ag.text) throw new Error('Agent failed');
                    toast({ title: `🎙️ "${tr.text.substring(0, 50)}..."`, description: ag.text, duration: 10000 });
                    await speakText(ag.text);
                } catch (err: any) { setVoiceState('idle'); toast({ title: "Error", description: err.message, variant: "destructive" }); }
            };
            mediaRecorder.start();
            setVoiceState('recording');
        } catch (err: any) { toast({ title: "Mic tidak bisa diakses", description: err.message, variant: "destructive" }); }
    };

    const handlePanic = async () => {
        if (!userId) return;
        setIsPanicking(true);
        try {
            const data = await (await fetch('/api/panic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) })).json();
            if (data.success && data.text) { toast({ title: "🌬️ Jiwo di sini", description: data.text, duration: 15000 }); await speakText(data.text); }
        } catch { } finally { setIsPanicking(false); }
    };

    const handleProactiveToggle = async (checked: boolean) => {
        setAllowProactive(checked);
        if (userId) { await supabase.from('user_preferences').update({ allow_proactive_greeting: checked }).eq('user_id', userId); if (checked) triggerProactiveGreeting(userId); }
    };

    const handleNightDumpSubmit = async () => {
        if (!nightDumpText.trim() || !userId) return;
        setIsSubmittingNightDump(true);
        try {
            await fetch('/api/rituals/trigger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ritualType: 'night_dump', content: nightDumpText }) });
            const ag = await (await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `Night dump: ${nightDumpText}`, userId }) })).json();
            setNightDumpDone(true);
            setNightDumpText('');
            toast({ title: "🌙 Sampah otak berhasil dibuang!", description: ag.text, duration: 12000 });
            if (ag.text) speakText(ag.text);
        } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
        finally { setIsSubmittingNightDump(false); }
    };

    const voiceCfg = {
        idle: { icon: Mic, label: "Voice Note", cls: "bg-violet-500 hover:bg-violet-600" },
        recording: { icon: MicOff, label: "Stop Recording", cls: "bg-red-500 hover:bg-red-600 animate-pulse" },
        transcribing: { icon: Loader2, label: "Transcribing...", cls: "bg-gray-400" },
        thinking: { icon: Loader2, label: "Jiwo berpikir...", cls: "bg-amber-400" },
        speaking: { icon: Volume2, label: "Jiwo ngomong...", cls: "bg-green-500 animate-pulse" },
    }[voiceState];

    const TOOLS = [
        { key: 'breathe', title: "Breathe", description: "Teknik napas 4-7-8 untuk menenangkan pikiran dan stabilkan detak jantung.", icon: Wind, color: "bg-green-100 text-green-700", emoji: "🌬️", action: () => setActiveModal('breathe') },
        { key: 'journal', title: "Journal", description: "Tulis jurnal harianmu, lacak mood, dan ekspresikan perasaanmu.", icon: PenTool, color: "bg-amber-100 text-amber-700", emoji: "📓", action: () => setActiveModal('journal') },
        { key: 'visualize', title: "Visualize", description: "Perjalanan visual imersif ke pantai, pegunungan, dan alam terbuka.", icon: Sparkles, color: "bg-pink-100 text-pink-700", emoji: "🌅", action: () => setActiveModal('visualize') },
        { key: 'learn', title: "Learn", description: "Pelajari ilmu di balik panic attack dan anxiety untuk pulihkan kendali.", icon: BookOpen, color: "bg-blue-100 text-blue-700", emoji: "📚", action: null },
        { key: 'play', title: "Play", description: "Mini-games seru yang dirancang untuk alihkan fokus dari kecemasan.", icon: Gamepad2, color: "bg-purple-100 text-purple-700", emoji: "🎮", action: null },
        { key: 'sleep', title: "Sleep", description: "Soundscape menenangkan dan cerita untuk bantu tertidur nyenyak.", icon: Moon, color: "bg-indigo-100 text-indigo-700", emoji: "🌙", action: null, image: "/images/sleep-monster.png" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {/* Modals */}
            {activeModal === 'journal' && <JournalModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'breathe' && <BreatheModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'visualize' && <VisualizeModal onClose={() => setActiveModal(null)} />}

            {/* Top Controls */}
            <div className="absolute top-0 right-0 flex items-center gap-3 z-10">
                <Link href="/settings">
                    <Button variant="ghost" size="icon" className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm">
                        <Settings className="h-4 w-4 text-gray-600" />
                    </Button>
                </Link>
                <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                    <Label htmlFor="proactive" className="text-sm font-medium text-gray-700 cursor-pointer">Jiwo nyapa duluan</Label>
                    <Switch id="proactive" checked={allowProactive} onCheckedChange={handleProactiveToggle} />
                </div>
            </div>

            {/* Hero */}
            <div className="text-center space-y-4 pt-12">
                <h2 className="text-3xl font-bold text-[#3D3D3D]">How are you feeling today?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Jiwo siap menemanimu. Pilih aktivitas di bawah atau pakai Panic Relief untuk bantuan segera.</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button variant="destructive" className="rounded-full px-8 py-6 h-auto text-lg font-bold shadow-xl hover:scale-105 transition-transform" onClick={handlePanic} disabled={isPanicking}>
                        {isPanicking ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <AlertTriangle className="mr-2 h-6 w-6" />}
                        {isPanicking ? "Menenangkan..." : "Panic Relief"}
                    </Button>
                    <Button className={`rounded-full px-6 py-6 h-auto text-base font-semibold shadow-xl hover:scale-105 transition-transform text-white ${voiceCfg.cls}`} onClick={handleVoiceNote} disabled={voiceState === 'transcribing' || voiceState === 'thinking'}>
                        <voiceCfg.icon className={`mr-2 h-5 w-5 ${(voiceState === 'transcribing' || voiceState === 'thinking') ? 'animate-spin' : ''}`} />
                        {voiceCfg.label}
                    </Button>
                </div>
                {voiceTranscript && voiceState !== 'idle' && <p className="text-sm text-gray-500 italic">"{voiceTranscript}"</p>}
            </div>

            {/* Night Dump */}
            {showNightDump && (
                <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
                    <CardContent className="p-6">
                        {nightDumpDone ? (
                            <div className="text-center space-y-2 py-4">
                                <p className="text-4xl">✨</p>
                                <p className="font-semibold text-indigo-700">Sampah otak berhasil dibuang!</p>
                                <p className="text-sm text-gray-500">Tidur nyenyak ya 🌙</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <CloudRain className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-bold text-indigo-700 text-lg">🌙 Night Dump</h3>
                                </div>
                                <p className="text-gray-600 text-sm">Mau cerita apa yang masih kepikiran hari ini?</p>
                                <Textarea value={nightDumpText} onChange={(e) => setNightDumpText(e.target.value)} placeholder="Tulis apapun yang ada di kepala..." className="min-h-[100px] bg-white/70 border-indigo-200 resize-none" />
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleNightDumpSubmit} disabled={!nightDumpText.trim() || isSubmittingNightDump}>
                                    {isSubmittingNightDump ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</> : "Buang Sampah Otak 🗑️"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TOOLS.map((tool) => (
                    <Card key={tool.key} onClick={tool.action ?? undefined} className={`group hover:shadow-2xl transition-all duration-300 border-none bg-white/50 backdrop-blur-sm ${tool.action ? 'cursor-pointer hover:-translate-y-1' : 'opacity-70'}`}>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform text-2xl`}>
                                    {tool.emoji}
                                </div>
                                {tool.image && (
                                    <div className="relative w-24 h-24 -mt-4 -mr-4 group-hover:scale-110 transition-transform duration-300 z-10">
                                        <Image src={tool.image} alt={tool.title} fill priority className="object-contain" />
                                    </div>
                                )}
                                {!tool.action && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Segera hadir</span>}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-[#3D3D3D]">{tool.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Journey & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                <Card className="bg-gradient-to-br from-[#FFD3BA] to-[#FF9A76] border-none text-[#3D3D3D] cursor-pointer hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between">
                        <div><h3 className="text-2xl font-bold">My Journey</h3><p className="opacity-80">View your progress map</p></div>
                        <Map className="h-12 w-12 opacity-50" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[#B8C9E3] to-[#7A9CC6] border-none text-[#3D3D3D] cursor-pointer hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between">
                        <div><h3 className="text-2xl font-bold">My Stats</h3><p className="opacity-80">Weekly mood analysis</p></div>
                        <BarChart2 className="h-12 w-12 opacity-50" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
