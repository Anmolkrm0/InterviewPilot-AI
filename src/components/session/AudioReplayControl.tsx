"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioReplayControlProps {
  promptText: string;
}

export function AudioReplayControl({ promptText }: AudioReplayControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(promptText);
    utterance.rate = 0.95; // Calm, respectful pace
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleAudio}
      title="Audio replay for question"
      aria-label="Replay question audio"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer",
        isPlaying
          ? "bg-primary text-white shadow-xs animate-pulse"
          : "bg-surface-muted text-primary hover:bg-surface-blue hover:scale-105"
      )}
    >
      {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}
