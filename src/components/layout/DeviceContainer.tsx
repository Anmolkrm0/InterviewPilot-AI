"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, Wifi, Battery } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shell/ThemeToggle";

interface DeviceContainerProps {
  children: React.ReactNode;
  defaultMode?: "mobile" | "web";
  allowToggle?: boolean;
}

export function DeviceContainer({
  children,
  defaultMode = "mobile",
  allowToggle = true,
}: DeviceContainerProps) {
  const [mode, setMode] = useState<"mobile" | "web">(defaultMode);
  const [currentTime, setCurrentTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0EEF9] dark:bg-zinc-950 flex flex-col items-center">
      {/* Device Viewport Toggle & Theme Selector (Desktop Only) */}
      {allowToggle && (
        <div className="hidden md:flex items-center gap-2 fixed top-4 right-6 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-border">
          <div className="flex items-center gap-1 bg-surface-muted/80 p-0.5 rounded-full">
            <button
              type="button"
              onClick={() => setMode("mobile")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                mode === "mobile"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-muted hover:text-text"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile View</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("web")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                mode === "web"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-muted hover:text-text"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Web View</span>
            </button>
          </div>
          <div className="h-4 w-px bg-border mx-0.5" />
          <ThemeToggle />
        </div>
      )}

      {/* Container Rendering */}
      {mode === "mobile" ? (
        <div className="w-full flex justify-center items-center py-0 md:py-8 min-h-screen">
          {/* Authentic Mobile chassis on desktop, full-width on mobile */}
          <div className="w-full max-w-[420px] md:h-[860px] md:max-h-[92vh] bg-surface flex flex-col md:rounded-[44px] md:border-[10px] md:border-[#1E1B2E] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] md:overflow-hidden relative">
            {/* iOS Status Bar & Dynamic Island (Desktop Frame Mode) */}
            <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 select-none z-20 shrink-0">
              <span className="text-xs font-semibold tracking-tight text-text tabular-nums">
                {currentTime}
              </span>
              {/* Dynamic Island */}
              <div className="h-5 w-24 bg-black rounded-full shadow-inner flex items-center justify-end px-2">
                <div className="h-2 w-2 rounded-full bg-blue-950/80 border border-blue-900/40 mr-1" />
              </div>
              <div className="flex items-center gap-1.5 text-text">
                <Wifi className="h-3.5 w-3.5" />
                <Battery className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Mobile Content Screen */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative">
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="hidden md:flex justify-center pb-2 pt-1 shrink-0 z-20">
              <div className="w-32 h-1 bg-zinc-300 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Full Web View Mode */
        <div className="w-full max-w-5xl min-h-[92vh] bg-surface md:my-6 md:rounded-3xl md:border md:border-border md:shadow-lg flex flex-col overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}
