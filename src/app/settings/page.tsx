"use client";

import { useState, useEffect } from "react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Brain, Sliders, Moon, Sun, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Memory {
  id: string;
  content: string;
  type: string;
  importance: number;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  trauma_trigger: "bg-red-100 text-red-700 border-red-200",
  preference: "bg-blue-100 text-blue-700 border-blue-200",
  fact: "bg-gray-100 text-gray-700 border-gray-200",
  coping_strategy: "bg-green-100 text-green-700 border-green-200",
  event: "bg-purple-100 text-purple-700 border-purple-200",
};

const TYPE_LABELS: Record<string, string> = {
  trauma_trigger: "⚡ Trigger",
  preference: "💙 Preferensi",
  fact: "📌 Fakta",
  coping_strategy: "🌿 Coping",
  event: "📅 Event",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [tone, setTone] = useState("bestie");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [morningRitual, setMorningRitual] = useState(false);
  const [nightRitual, setNightRitual] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTone, setIsSavingTone] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const user = await getSafeUser();
    if (!user) { router.replace("/auth"); return; }
    setUserId(user.id);

    // Load preferences + memories + rituals in parallel
    const [prefRes, memoriesRes, ritualsRes] = await Promise.all([
      supabase.from("users").select("agent_preferences").eq("id", user.id).single(),
      fetch(`/api/memory?userId=${user.id}`).then(r => r.json()),
      supabase.from("rituals").select("type, is_active").eq("user_id", user.id),
    ]);

    if (prefRes.data?.agent_preferences?.tone) {
      setTone(prefRes.data.agent_preferences.tone);
    }

    if (memoriesRes.success) setMemories(memoriesRes.memories || []);

    if (ritualsRes.data) {
      ritualsRes.data.forEach((r: any) => {
        if (r.type === "morning_pulse") setMorningRitual(r.is_active);
        if (r.type === "night_dump") setNightRitual(r.is_active);
      });
    }

    setIsLoading(false);
  };

  const handleToneChange = async (newTone: string) => {
    if (!userId) return;
    setTone(newTone);
    setIsSavingTone(true);
    const { error } = await supabase
      .from("users")
      .update({
        agent_preferences: { tone: newTone }
      })
      .eq("id", userId);

    setIsSavingTone(false);
    if (error) {
      toast({ title: "Gagal simpan", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Gaya Jiwo diperbarui!", description: `Sekarang Jiwo akan ngobrol seperti ${newTone}.` });
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!userId) return;
    setDeletingId(memoryId);
    const res = await fetch("/api/memory", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memoryId, userId }),
    });
    const data = await res.json();
    setDeletingId(null);
    if (data.success) {
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      toast({ title: "🗑️ Memori dihapus" });
    } else {
      toast({ title: "Gagal hapus", description: data.error, variant: "destructive" });
    }
  };

  const handleRitualToggle = async (type: "morning_pulse" | "night_dump", active: boolean) => {
    if (!userId) return;
    if (type === "morning_pulse") setMorningRitual(active);
    else setNightRitual(active);

    // Upsert ritual
    const { data: existing } = await supabase
      .from("rituals")
      .select("id")
      .eq("user_id", userId)
      .eq("type", type)
      .maybeSingle();

    if (existing) {
      await supabase.from("rituals").update({ is_active: active }).eq("id", existing.id);
    } else {
      await supabase.from("rituals").insert({ user_id: userId, type, is_active: active });
    }

    toast({ title: active ? "🔔 Ritual diaktifkan" : "🔕 Ritual dinonaktifkan" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#756657]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] to-[#F0EBE5] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3D3D3D]">⚙️ Pengaturan Jiwo</h1>
          <p className="text-gray-500 mt-1">Personalisasi cara Jiwo ngobrol sama kamu</p>
        </div>

        {/* Tone Slider */}
        <Card className="border-none shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#756657]" />
              <CardTitle>Gaya Jiwo</CardTitle>
            </div>
            <CardDescription>Pilih cara Jiwo ngomong sama kamu</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={tone} onValueChange={handleToneChange} disabled={isSavingTone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih gaya..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bestie">🤙 Bestie — Santai, slang Gen-Z, kayak sahabat deket</SelectItem>
                <SelectItem value="coach">💪 Coach — Energetik, goal-oriented, action-focused</SelectItem>
                <SelectItem value="mom">🤗 Mom — Hangat, penyayang, bikin tenang</SelectItem>
                <SelectItem value="philosopher">🧠 Philosopher — Bijak, reflektif, bantu lo mikir dalam</SelectItem>
              </SelectContent>
            </Select>
            {isSavingTone && <p className="text-xs text-gray-400 mt-2">Menyimpan...</p>}
          </CardContent>
        </Card>

        {/* Rituals */}
        <Card className="border-none shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>🔔 Ritual Harian</CardTitle>
            <CardDescription>Aktifkan pengingat check-in dari Jiwo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-amber-500" />
                <div>
                  <Label className="font-medium">Morning Pulse</Label>
                  <p className="text-xs text-gray-400">Jiwo nyapa jam 07:30 WIB</p>
                </div>
              </div>
              <Switch
                checked={morningRitual}
                onCheckedChange={(v) => handleRitualToggle("morning_pulse", v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-indigo-500" />
                <div>
                  <Label className="font-medium">Night Dump</Label>
                  <p className="text-xs text-gray-400">Jiwo ajak buang sampah otak jam 22:00 WIB</p>
                </div>
              </div>
              <Switch
                checked={nightRitual}
                onCheckedChange={(v) => handleRitualToggle("night_dump", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Memory Management */}
        <Card className="border-none shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#756657]" />
              <CardTitle>Ingatan Jiwo</CardTitle>
            </div>
            <CardDescription>
              {memories.length} hal yang Jiwo ingat tentang kamu. Kamu bisa hapus yang tidak relevan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memories.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Jiwo belum punya ingatan tentang kamu. Mulai ngobrol dulu!
              </p>
            ) : (
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-xs border ${TYPE_COLORS[memory.type] || "bg-gray-100 text-gray-600"}`}>
                          {TYPE_LABELS[memory.type] || memory.type}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          Penting: {memory.importance}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{memory.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteMemory(memory.id)}
                      disabled={deletingId === memory.id}
                    >
                      {deletingId === memory.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
