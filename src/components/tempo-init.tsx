"use client";

import { useEffect } from "react";

export function TempoInit() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TEMPO) {
      // Tempo devtools initialization (deprecated)
    }
  }, []);

  return null;
}