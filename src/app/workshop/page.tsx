"use client";

import { useEffect, useState } from "react";
import { getSafeUser } from "@/lib/supabase";
import { WorkshopCard } from "@/components/workshop-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Clock, Users, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function WorkshopPage() {
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [reason, setReason] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const user = await getSafeUser();
      if (user) {
        setUserId(user.id);
        fetchWorkshops(user.id);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchWorkshops = async (uid: string) => {
    try {
      const res = await fetch(`/api/workshop/list?userId=${uid}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setUpcoming(data.upcoming || []);
      setRecommended(data.recommended_for_you);
      setReason(data.recommendation_reason);
    } catch (error) {
      console.error("Fetch workshops error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (workshopId: string) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/workshop/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId, userId })
      });
      const data = await res.json();
      
      if (data.error) {
        toast({
          title: "Gagal daftar",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Berhasil daftar!",
        description: "Cek kalender kamu ya.",
      });

      // Download .ics
      if (data.calendar_link) {
        const link = document.createElement("a");
        link.href = data.calendar_link;
        link.download = "workshop-jiwo.ics";
        link.click();
      }

      // Refresh data to show "Already Registered"
      fetchWorkshops(userId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftar.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-ici-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F0] pb-20 selection:bg-[#756657]/10">
      <div className="max-w-5xl mx-auto px-4 pt-10">
        
        {/* SECTION 1: HERO */}
        <Card className="bg-white/80 backdrop-blur-md border-none shadow-xl shadow-brown-900/5 overflow-hidden relative mb-12 rounded-[2rem]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#756657]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C4AB9C]/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#756657]/20 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
              <img src="/ici_win.png" alt="Ici" className="w-32 h-32 md:w-40 md:h-40 relative z-10 animate-float drop-shadow-2xl" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#756657]/10 text-[#756657] text-xs font-bold mb-4 uppercase tracking-wider">
                <Users className="w-3 h-3" /> Komunitas Jiwo
              </div>
              <h1 className="font-outfit text-4xl md:text-5xl font-extrabold text-[#3D3D3D] leading-tight">
                Workshop <span className="text-[#756657]">Bareng Ici</span>
              </h1>
              <p className="text-[#756657] mt-4 text-lg max-w-xl font-medium leading-relaxed opacity-90">
                Ngga perlu jago gambar. Di sini kita coret-coret isi kepala bareng temen. Ici yang jadi MC & host kamu.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                <Badge className="bg-white text-[#756657] border-[#756657]/20 shadow-sm px-3 py-1 hover:bg-white">Kelas Kecil (Max 8)</Badge>
                <Badge className="bg-white text-[#756657] border-[#756657]/20 shadow-sm px-3 py-1 hover:bg-white">Aman & Nyaman</Badge>
                <Badge className="bg-white text-[#756657] border-[#756657]/20 shadow-sm px-3 py-1 hover:bg-white">Tanpa Rekaman</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 2: RECOMMENDATION */}
        {recommended && (
          <div className="mb-16 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFD217]/20 rounded-2xl">
                  <Sparkles className="text-[#756657] w-6 h-6" />
                </div>
                <h2 className="font-outfit text-2xl md:text-3xl font-bold text-[#3D3D3D]">Ici Rasa Ini Cocok Buat Kamu</h2>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <WorkshopCard 
                  data={recommended} 
                  highlight 
                  onRegister={() => handleRegister(recommended.id)}
                />
              </div>
              <div className="flex flex-col justify-center bg-white/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/60 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <img src="/ici_win.png" className="w-20 h-20 grayscale rotate-12" alt="" />
                </div>
                <p className="text-[#756657] italic text-xl font-medium leading-relaxed relative z-10">
                  "{reason}"
                </p>
                <div className="flex items-center gap-2 mt-6">
                   <div className="w-8 h-px bg-[#756657]/30" />
                   <p className="text-[#756657] font-outfit font-bold">— Ici ✨</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: UPCOMING */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#756657]/10 rounded-2xl">
              <Calendar className="text-[#756657] w-6 h-6" />
            </div>
            <h2 className="font-outfit text-2xl md:text-3xl font-bold text-[#3D3D3D]">Jadwal Workshop Minggu Ini</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map((workshop: any) => (
              <WorkshopCard 
                key={workshop.id} 
                data={workshop} 
                onRegister={() => handleRegister(workshop.id)}
              />
            ))}
          </div>
          
          {upcoming.length === 0 && (
            <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-[#756657]/20">
              <div className="bg-[#756657]/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-[#756657]/30" />
              </div>
              <p className="text-[#756657]/60 font-medium">Belum ada jadwal workshop tersedia.<br/>Cek lagi nanti ya!</p>
            </div>
          )}
        </div>

        {/* DISCLAIMER */}
        <div className="mt-16 p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/50 text-center max-w-3xl mx-auto">
          <p className="text-xs text-[#756657]/70 leading-relaxed">
            <strong className="text-[#756657]">Disclaimer:</strong> Ini bukan pengganti terapi profesional. Workshop ini adalah ruang ekspresi diri dan komunitas Jiwo. 
            Partisipasi bersifat sukarela dan anonimitas sangat dihargai demi kenyamanan bersama.
          </p>
        </div>

      </div>
    </div>
  );
}
