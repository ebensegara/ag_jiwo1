"use client";

import Relaxation from "@/components/dashboard-pages/relaxation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BreatheModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
        <Relaxation />
      </div>
    </div>
  );
}
