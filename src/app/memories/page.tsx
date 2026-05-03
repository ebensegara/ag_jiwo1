"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Brain, Trash2, Search, Filter,
  Zap, Heart, BookOpen, Star, Lightbulb, Loader2,
  RefreshCw, AlertCircle
} from "lucide-react";
import { getSafeUser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface Memory {
  id: string;
  content: string;
  type: string;
  importance: number;
  source?: string;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Brain; color: string; bg: string; border: string }> = {
  trauma_trigger:   { label: "Trauma / Trigger",    icon: AlertCircle, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  preference:       { label: "Preferensi",           icon: Heart,       color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  fact:             { label: "Fakta Diri",            icon: BookOpen,    color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  coping_strategy:  { label: "Strategi Coping",      icon: Lightbulb,   color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  event:            { label: "Kejadian Penting",     icon: Star,        color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
};

const ALL_TYPES = ["all", "trauma_trigger", "preference", "fact", "coping_strategy", "event"];

function importanceDots(score: number) {
  return Array.from({ length: 10 }, (_, i) => (
    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < score ? "#785438" : "#E5E0DA" }} />
  ));
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [sortBy, setSortBy] = useState<"importance" | "date">("importance");
  const router = useRouter();
  const { toast } = useToast();

  const loadMemories = async () => {
    setLoading(true);
    try {
      const user = await getSafeUser();
      if (!user) { router.push("/auth"); return; }
      const res = await fetch(`/api/memory?userId=${user.id}`);
      const data = await res.json();
      if (data.success) setMemories(data.memories || []);
    } catch {
      toast({ title: "Gagal memuat memori", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMemories(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const user = await getSafeUser();
      if (!user) return;
      const res = await fetch("/api/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId: id, userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => prev.filter(m => m.id !== id));
        toast({ title: "🗑️ Memori dihapus", description: "Jiwo tidak akan ingat hal ini lagi." });
      }
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const filtered = useMemo(() => {
    let list = memories;
    if (activeType !== "all") list = list.filter(m => m.type === activeType);
    if (search.trim()) list = list.filter(m => m.content.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) =>
      sortBy === "importance"
        ? b.importance - a.importance
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [memories, activeType, search, sortBy]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: memories.length };
    memories.forEach(m => { c[m.type] = (c[m.type] || 0) + 1; });
    return c;
  }, [memories]);

  return (
    <div className="min-h-screen" style={{ background: "#F6F4F1", fontFamily: "Inter, sans-serif" }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-20 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "#FDFCFB", borderColor: "#E5E0DA", boxShadow: "0 1px 4px rgba(117,102,87,0.06)" }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: "#7A726B" }}>
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          </Link>
          <div className="w-px h-5" style={{ background: "#E5E0DA" }} />
          <Image src="/images/jiwo-logo.png" alt="Jiwo.AI" width={90} height={36} className="object-contain" />
        </div>
        <button onClick={loadMemories} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
          style={{ background: "#F5ECE8", color: "#785438" }}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#F5ECE8" }}>
              <Brain className="w-5 h-5" style={{ color: "#785438" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#3A332C", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Jiwo Memory
            </h1>
          </div>
          <p className="text-sm ml-13" style={{ color: "#7A726B" }}>
            {memories.length} hal yang Jiwo ingat tentang kamu. Memori ini digunakan untuk membuat Jiwo lebih personal.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
            const Icon = cfg.icon;
            const count = counts[type] || 0;
            return (
              <div key={type} className="rounded-2xl p-3 border text-center" style={{ background: cfg.bg, borderColor: cfg.border }}>
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: cfg.color }} />
                <p className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: cfg.color }}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#7A726B" }} />
            <input
              type="text"
              placeholder="Cari memori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
              style={{ background: "#FDFCFB", borderColor: "#E5E0DA", color: "#3A332C" }}
            />
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: "#7A726B" }} />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as "importance" | "date")}
              className="text-sm px-3 py-2.5 rounded-xl border outline-none"
              style={{ background: "#FDFCFB", borderColor: "#E5E0DA", color: "#3A332C" }}>
              <option value="importance">Terpenting</option>
              <option value="date">Terbaru</option>
            </select>
          </div>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_TYPES.map(type => {
            const isActive = activeType === type;
            const cfg = TYPE_CONFIG[type];
            const count = counts[type] || 0;
            return (
              <button key={type} onClick={() => setActiveType(type)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={{
                  background: isActive ? (cfg ? cfg.bg : "#F5ECE8") : "#FDFCFB",
                  borderColor: isActive ? (cfg ? cfg.border : "#E5D5C5") : "#E5E0DA",
                  color: isActive ? (cfg ? cfg.color : "#785438") : "#7A726B",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}>
                {type === "all" ? "Semua" : cfg?.label}
                <span className="px-1.5 py-0.5 rounded-full text-xs"
                  style={{ background: isActive ? "rgba(255,255,255,0.6)" : "#F0EBE6", color: "inherit" }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Memory List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#785438" }} />
            <p className="text-sm" style={{ color: "#7A726B" }}>Memuat memori Jiwo...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border" style={{ background: "#FDFCFB", borderColor: "#E5E0DA" }}>
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#785438" }} />
            <p className="font-semibold" style={{ color: "#3A332C" }}>
              {search || activeType !== "all" ? "Tidak ada memori yang cocok" : "Jiwo belum punya memori"}
            </p>
            <p className="text-sm mt-1" style={{ color: "#7A726B" }}>
              {search || activeType !== "all"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Mulai ngobrol dengan Jiwo — dia akan mulai mengingatmu 🌱"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((memory) => {
              const cfg = TYPE_CONFIG[memory.type] || TYPE_CONFIG.fact;
              const Icon = cfg.icon;
              return (
                <div key={memory.id}
                  className="rounded-2xl border p-4 flex items-start gap-4 transition-all hover:shadow-md group"
                  style={{ background: "#FDFCFB", borderColor: "#E5E0DA", boxShadow: "0 1px 4px rgba(117,102,87,0.04)" }}>
                  {/* Type Icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                      {memory.source === "auto_extract" && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: "#EEF2FF", color: "#4338CA" }}>
                          <Zap className="w-2.5 h-2.5" /> Auto
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "#7A726B" }}>{timeAgo(memory.created_at)}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#3A332C" }}>{memory.content}</p>
                    {/* Importance Dots */}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs mr-1" style={{ color: "#7A726B" }}>Kepentingan:</span>
                      {importanceDots(memory.importance)}
                      <span className="text-xs ml-1" style={{ color: "#7A726B" }}>{memory.importance}/10</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(memory.id)}
                    disabled={deleting === memory.id}
                    className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                    title="Hapus memori ini">
                    {deleting === memory.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      : <Trash2 className="w-4 h-4 text-red-400" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        {!loading && memories.length > 0 && (
          <div className="mt-8 rounded-2xl p-4 border" style={{ background: "#FFF8F5", borderColor: "#E5D5C5" }}>
            <div className="flex gap-3">
              <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#785438" }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#3A332C" }}>Bagaimana Jiwo menggunakan memori ini?</p>
                <ul className="text-xs space-y-1" style={{ color: "#7A726B" }}>
                  <li>• <strong>Saat chat:</strong> Jiwo melakukan <em>semantic search</em> (vector similarity) untuk menemukan memori yang relevan dengan topik obrolanmu</li>
                  <li>• <strong>Saat panic:</strong> Jiwo menyertakan semua memori untuk respons yang lebih personal dan tepat sasaran</li>
                  <li>• <strong>Auto-save:</strong> Memori baru diekstrak otomatis dari setiap percakapan menggunakan Gemini AI</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
