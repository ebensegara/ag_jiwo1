"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Workshop {
  id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  duration_min: number;
  max_participant: number;
  scheduled_at: string;
  materials_needed: string[];
  registrant_count?: number;
}

interface WorkshopCardProps {
  data: Workshop;
  highlight?: boolean;
  isRegistered?: boolean;
  onRegister?: () => void;
}

export function WorkshopCard({ data, highlight, isRegistered: initialRegistered, onRegister }: WorkshopCardProps) {
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async () => {
    setLoading(true);
    try {
      // In a real app, we'd get userId from session
      // For this demo, we'll assume the parent handles the actual API call or we use a dummy userId
      if (onRegister) {
        await onRegister();
        setIsRegistered(true);
      }
    } catch (error) {
      toast({
        title: "Gagal daftar",
        description: "Coba lagi nanti ya.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Card className={`p-6 flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:shadow-brown-900/10 hover:-translate-y-2 rounded-3xl bg-white/60 backdrop-blur-sm border-white/50 ${highlight ? "ring-2 ring-[#756657]/20 bg-white/80" : ""}`}>
      <div className="flex justify-between items-start mb-4">
        <Badge variant="secondary" className="capitalize bg-[#756657]/10 text-[#756657] border-none px-3 py-0.5 font-bold">
          {data.type.replace('_', ' ')}
        </Badge>
        {highlight && (
          <Badge variant="outline" className="bg-[#FFD217]/10 border-[#FFD217]/30 text-[#756657] flex gap-1 font-bold px-2 py-0.5">
            <Sparkles className="w-3 h-3 text-[#FFD217]" /> Rekomendasi
          </Badge>
        )}
      </div>

      <h3 className="font-outfit text-2xl font-bold mt-1 text-[#3D3D3D] leading-snug">{data.title}</h3>
      <p className="text-sm text-[#756657] mt-3 line-clamp-3 flex-grow font-medium leading-relaxed opacity-80">{data.description}</p>

      <div className="grid grid-cols-2 gap-y-4 mt-6 text-xs text-[#756657] font-bold">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#756657]/5 rounded-lg">
            <Calendar className="w-4 h-4 text-[#756657]" />
          </div>
          {formatDate(data.scheduled_at)}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#756657]/5 rounded-lg">
            <Clock className="w-4 h-4 text-[#756657]" />
          </div>
          {data.duration_min} menit
        </div>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#756657]/5 rounded-lg">
            <Users className="w-4 h-4 text-[#756657]" />
          </div>
          {data.registrant_count || 0}/{data.max_participant} slot
        </div>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#756657]/5 rounded-lg">
            <Badge variant="outline" className="text-[10px] py-0 border-[#756657]/30 text-[#756657] font-extrabold capitalize">{data.level}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-[#756657]/10 pt-4">
        <p className="text-[10px] font-extrabold text-[#756657]/40 uppercase tracking-widest mb-2">Peralatan:</p>
        <div className="flex flex-wrap gap-2">
          {data.materials_needed?.map((m, i) => (
            <span key={i} className="text-[11px] font-bold text-[#756657] bg-white/50 px-2 py-0.5 rounded-md border border-white/80">
              {m}
            </span>
          ))}
        </div>
      </div>

      <Button
        onClick={handleRegister}
        disabled={isRegistered || loading}
        className={`w-full mt-6 py-6 rounded-2xl font-outfit font-bold text-lg transition-all duration-300 ${
          isRegistered 
            ? "bg-[#756657]/10 text-[#756657]/50 hover:bg-[#756657]/10 cursor-not-allowed" 
            : "bg-[#756657] text-white hover:bg-[#3D3D3D] shadow-lg shadow-brown-900/20 active:scale-95"
        }`}
      >
        {loading ? "Mendaftar..." : isRegistered ? "Terdaftar ✓" : "Ikut Workshop"}
      </Button>
    </Card>
  );
}
