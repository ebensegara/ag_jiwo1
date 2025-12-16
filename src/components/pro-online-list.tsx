"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Zap } from "lucide-react";
import ProOnlineCard from "./pro-online-card";
import { getOnlineProfessionals, subscribeProfessionalStatus, type Professional } from "@/lib/professional";

export default function ProOnlineList() {
  const [onlinePros, setOnlinePros] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOnlineProfessionals();

    // Subscribe to real-time updates
    const subscription = subscribeProfessionalStatus((payload) => {
      if (payload.new.online_status) {
        // Professional came online
        setOnlinePros((prev) => {
          const exists = prev.find((p) => p.id === payload.new.id);
          if (!exists) {
            return [payload.new, ...prev];
          }
          return prev.map((p) => (p.id === payload.new.id ? payload.new : p));
        });
      } else {
        // Professional went offline
        setOnlinePros((prev) => prev.filter((p) => p.id !== payload.new.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOnlineProfessionals = async () => {
    setIsLoading(true);
    const pros = await getOnlineProfessionals();
    setOnlinePros(pros);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-[#756657]/10 to-[#8a7a6a]/10">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (onlinePros.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-[#756657]/10 to-[#8a7a6a]/10 border-[#756657]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-[#756657]" />
          Online Now - Instant Chat
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {onlinePros.length} available
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {onlinePros.map((pro) => (
            <ProOnlineCard key={pro.id} professional={pro} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          Chat instantly with professionals who are online now
        </p>
      </CardContent>
    </Card>
  );
}
