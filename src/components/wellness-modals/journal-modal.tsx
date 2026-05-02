"use client";

import Journal from "@/components/journal";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JournalModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl mt-8 mb-8 relative animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-[#3D3D3D]">📓 My Journal</h2>
            <p className="text-gray-500 text-sm mt-1">Tulis perasaanmu hari ini</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <Journal />
        </div>
      </div>
    </div>
  );
}
