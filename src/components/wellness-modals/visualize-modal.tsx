"use client";

import { useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Scene {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  bg: string;
  elements: React.ReactNode;
}

// ── CSS-only animated scenes ──────────────────────────────────────────────

function BeachScene() {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B0E0FF 40%, #F4E4C1 65%, #D4A574 75%, #5B8FA8 76%, #1E6B8A 100%)" }}>
      {/* Sun */}
      <div className="absolute top-12 right-16 w-20 h-20 rounded-full" style={{ background: "radial-gradient(circle, #FFF7A0 30%, #FFD700 70%, #FFA500 100%)", boxShadow: "0 0 40px #FFD70080, 0 0 80px #FFA50040", animation: "pulse 4s ease-in-out infinite" }} />
      {/* Clouds */}
      <div className="absolute top-8 left-1/4 opacity-80" style={{ animation: "float 8s ease-in-out infinite" }}>
        <div className="flex gap-0">
          <div className="w-16 h-10 rounded-full bg-white" />
          <div className="w-20 h-12 rounded-full bg-white -ml-4 -mt-2" />
          <div className="w-12 h-8 rounded-full bg-white -ml-3" />
        </div>
      </div>
      <div className="absolute top-16 left-2/3 opacity-60" style={{ animation: "float 12s ease-in-out infinite reverse" }}>
        <div className="flex gap-0">
          <div className="w-12 h-8 rounded-full bg-white" />
          <div className="w-16 h-10 rounded-full bg-white -ml-3 -mt-1" />
        </div>
      </div>
      {/* Waves */}
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute w-[200%]" style={{ bottom: `${80 + i * 30}px`, left: "-50%", height: "40px", background: i === 0 ? "rgba(30,107,138,0.6)" : "rgba(91,143,168,0.4)", borderRadius: "50%", animation: `wave ${3 + i * 0.5}s ease-in-out infinite ${i * 0.8}s alternate` }} />
      ))}
      {/* Sand */}
      <div className="absolute bottom-0 w-full h-24" style={{ background: "linear-gradient(180deg, #D4A574 0%, #C49060 100%)" }} />
      {/* Palm tree */}
      <div className="absolute bottom-20 left-12">
        <div className="w-3 bg-amber-800 mx-auto" style={{ height: "80px", borderRadius: "4px", transform: "rotate(-5deg)" }} />
        {[-40, -20, 0, 20, 40].map((r, i) => (
          <div key={i} className="absolute -top-6 left-1/2 w-16 h-4 bg-green-600 rounded-full origin-left" style={{ transform: `translateX(-8px) rotate(${r}deg)` }} />
        ))}
      </div>
      {/* Text overlay */}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-white/80 text-sm font-medium tracking-widest uppercase">Pantai • Tenang & Damai</p>
      </div>
    </div>
  );
}

function MountainScene() {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #e94560 100%)" }}>
      {/* Stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{ width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`, top: `${Math.random() * 50}%`, left: `${Math.random() * 100}%`, animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`, opacity: 0.8 }} />
      ))}
      {/* Moon */}
      <div className="absolute top-10 right-12 w-16 h-16 rounded-full bg-yellow-100" style={{ boxShadow: "0 0 30px #FFF7A080" }} />
      {/* Mountains back */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 400 200" className="w-full" preserveAspectRatio="none">
          <polygon points="0,200 80,60 160,120 240,40 320,100 400,50 400,200" fill="#0f3460" />
          <polygon points="0,200 60,80 140,140 220,60 300,110 380,70 400,90 400,200" fill="#16213e" opacity="0.8" />
        </svg>
      </div>
      {/* Snow caps */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 400 200" className="w-full" preserveAspectRatio="none">
          <polygon points="220,60 230,80 210,80" fill="white" opacity="0.9" />
          <polygon points="80,60 92,82 68,82" fill="white" opacity="0.7" />
        </svg>
      </div>
      {/* Pine trees */}
      {[30, 60, 340, 370].map((x, i) => (
        <div key={i} className="absolute bottom-16" style={{ left: x }}>
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[30px] border-l-transparent border-r-transparent border-b-green-900" />
          <div className="w-2 h-6 bg-amber-900 mx-auto" />
        </div>
      ))}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-white/70 text-sm font-medium tracking-widest uppercase">Pegunungan • Kuat & Kokoh</p>
      </div>
    </div>
  );
}

function ForestScene() {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "linear-gradient(180deg, #2d5a27 0%, #1e4020 40%, #0f2410 100%)" }}>
      {/* Light rays */}
      {[15, 30, 50, 70, 85].map((l, i) => (
        <div key={i} className="absolute top-0 w-8 opacity-20" style={{ left: `${l}%`, height: "70%", background: "linear-gradient(180deg, #FFD700 0%, transparent 100%)", transform: `rotate(${(i - 2) * 5}deg)`, transformOrigin: "top center", animation: `sway ${4 + i}s ease-in-out infinite ${i * 0.5}s alternate` }} />
      ))}
      {/* Trees */}
      {[0, 8, 18, 30, 55, 65, 75, 85, 92].map((x, i) => (
        <div key={i} className="absolute bottom-0" style={{ left: `${x}%`, zIndex: i % 2 }}>
          <div className="relative" style={{ width: "40px" }}>
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[60px] border-l-transparent border-r-transparent" style={{ borderBottomColor: i % 3 === 0 ? "#1a5c14" : "#2d7a26" }} />
            <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[50px] border-l-transparent border-r-transparent -mt-10 mx-auto" style={{ borderBottomColor: i % 3 === 0 ? "#226b1c" : "#38922f" }} />
            <div className="w-4 h-16 bg-amber-900 mx-auto" style={{ opacity: 0.8 }} />
          </div>
        </div>
      ))}
      {/* Ground */}
      <div className="absolute bottom-0 w-full h-12" style={{ background: "linear-gradient(180deg, #1a4a15 0%, #0d2e09 100%)" }} />
      {/* Fireflies */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="absolute w-2 h-2 rounded-full bg-yellow-300" style={{ top: `${40 + Math.random() * 40}%`, left: `${10 + Math.random() * 80}%`, animation: `twinkle ${1 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 3}s`, boxShadow: "0 0 8px #FFD700" }} />
      ))}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-white/70 text-sm font-medium tracking-widest uppercase">Hutan • Segar & Hidup</p>
      </div>
    </div>
  );
}

function StarScene() {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)" }}>
      {/* Milky way */}
      <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse 80% 30% at 50% 50%, #8080FF 0%, transparent 70%)" }} />
      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => {
        const size = Math.random() * 3 + 0.5;
        return (
          <div key={i} className="absolute rounded-full bg-white" style={{ width: size, height: size, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 4}s`, opacity: 0.7 + Math.random() * 0.3 }} />
        );
      })}
      {/* Shooting star */}
      <div className="absolute top-1/4 left-1/4 w-24 h-0.5 bg-white opacity-0" style={{ transform: "rotate(-30deg)", animation: "shootingStar 5s linear infinite 2s" }} />
      {/* Big stars */}
      {[[20, 20], [80, 15], [50, 35], [10, 60], [90, 70]].map(([t, l], i) => (
        <div key={i} className="absolute text-yellow-200" style={{ top: `${t}%`, left: `${l}%`, fontSize: "20px", animation: `twinkle ${3 + i}s ease-in-out infinite ${i * 0.7}s` }}>★</div>
      ))}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-white/70 text-sm font-medium tracking-widest uppercase">Bintang • Tak Terbatas</p>
      </div>
    </div>
  );
}

function SunsetScene() {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #FF6B35 25%, #FF8C42 40%, #FFA45B 55%, #FFD166 70%, #7BC8F6 85%, #4A90D9 100%)" }}>
      {/* Sun */}
      <div className="absolute" style={{ bottom: "35%", left: "50%", transform: "translateX(-50%)", width: "80px", height: "80px", borderRadius: "50%", background: "radial-gradient(circle, #FFF5A0 20%, #FFD700 60%, #FF8C00 100%)", boxShadow: "0 0 60px #FFD70060, 0 0 120px #FF8C0030" }} />
      {/* Horizon glow */}
      <div className="absolute w-full" style={{ bottom: "33%", height: "80px", background: "radial-gradient(ellipse 80% 50% at 50% 100%, #FF6B35 0%, transparent 70%)", opacity: 0.8 }} />
      {/* Ocean */}
      <div className="absolute bottom-0 w-full" style={{ height: "35%", background: "linear-gradient(180deg, #4A90D9 0%, #1E4A8A 100%)" }}>
        {/* Sun reflection */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16" style={{ height: "100%", background: "linear-gradient(180deg, #FFD70040 0%, transparent 100%)" }} />
      </div>
      {/* Waves */}
      {[0, 1].map(i => (
        <div key={i} className="absolute w-[200%] -left-1/2" style={{ bottom: `${30 + i * 8}%`, height: "20px", background: "rgba(255,255,255,0.15)", borderRadius: "50%", animation: `wave ${4 + i}s ease-in-out infinite ${i}s alternate` }} />
      ))}
      {/* Birds */}
      {[[20, 15], [25, 12], [35, 18], [65, 10], [72, 14]].map(([l, t], i) => (
        <div key={i} className="absolute text-gray-800 text-xs" style={{ left: `${l}%`, top: `${t}%`, animation: `float ${3 + i}s ease-in-out infinite ${i * 0.3}s` }}>〜</div>
      ))}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-white/80 text-sm font-medium tracking-widest uppercase">Sunset • Refleksi & Syukur</p>
      </div>
    </div>
  );
}

const SCENES: Scene[] = [
  { id: "beach", name: "🏖️ Pantai", emoji: "🏖️", tagline: "Suara ombak, angin sepoi-sepoi, pasir hangat", bg: "from-blue-400 to-cyan-300", elements: <BeachScene /> },
  { id: "mountain", name: "🏔️ Pegunungan", emoji: "🏔️", tagline: "Keheningan malam di atas awan", bg: "from-slate-700 to-indigo-900", elements: <MountainScene /> },
  { id: "forest", name: "🌲 Hutan", emoji: "🌲", tagline: "Cahaya senja dan kunang-kunang", bg: "from-green-700 to-green-900", elements: <ForestScene /> },
  { id: "stars", name: "✨ Bintang", emoji: "✨", tagline: "Langit malam yang penuh keajaiban", bg: "from-indigo-900 to-black", elements: <StarScene /> },
  { id: "sunset", name: "🌅 Sunset", emoji: "🌅", tagline: "Cakrawala merah jingga di tepi laut", bg: "from-orange-400 to-rose-600", elements: <SunsetScene /> },
];

export default function VisualizeModal({ onClose }: { onClose: () => void }) {
  const [activeScene, setActiveScene] = useState<Scene | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-3xl shadow-2xl bg-[#0f0f1a] overflow-hidden animate-in zoom-in-95 duration-300" style={{ maxHeight: "90vh" }}>

        {/* Global CSS for scene animations */}
        <style>{`
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes wave { 0% { transform: translateX(0) scaleY(1); } 100% { transform: translateX(5%) scaleY(1.1); } }
          @keyframes twinkle { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
          @keyframes sway { 0% { transform: rotate(-3deg); } 100% { transform: rotate(3deg); } }
          @keyframes shootingStar { 0% { opacity: 0; transform: rotate(-30deg) translateX(0); } 10% { opacity: 1; } 30% { opacity: 0; transform: rotate(-30deg) translateX(200px); } 100% { opacity: 0; } }
        `}</style>

        {activeScene ? (
          // Full-screen scene view
          <div className="relative" style={{ height: "80vh" }}>
            <div className="absolute inset-0">{activeScene.elements}</div>
            {/* Controls overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <Button variant="ghost" size="sm" onClick={() => setActiveScene(null)} className="bg-black/30 hover:bg-black/50 text-white rounded-full px-4">
                <ChevronLeft className="h-4 w-4 mr-1" /> Pilih Scene
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="bg-black/30 hover:bg-black/50 text-white rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* Scene name */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="text-white font-semibold text-lg bg-black/30 px-4 py-1 rounded-full">{activeScene.name}</span>
            </div>
            {/* Relaxation tip */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-center">
              <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <p className="text-white/90 text-sm">Tutup mata sejenak, bayangkan dirimu di sini 🌿</p>
                <p className="text-white/60 text-xs mt-1">Tarik napas dalam... tahan... hembuskan perlahan</p>
              </div>
            </div>
          </div>
        ) : (
          // Scene picker
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">🌅 Visualisasi</h2>
                <p className="text-gray-400 text-sm mt-1">Pilih tempat yang ingin kamu kunjungi</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SCENES.map((scene) => (
                <button key={scene.id} onClick={() => setActiveScene(scene)} className="group relative h-40 rounded-2xl overflow-hidden border border-white/10 hover:border-white/40 transition-all hover:scale-105 hover:shadow-2xl">
                  <div className="absolute inset-0">{scene.elements}</div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-bold text-sm">{scene.name}</p>
                    <p className="text-white/70 text-xs">{scene.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
