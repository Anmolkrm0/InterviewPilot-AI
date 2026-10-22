"use client";

import React from "react";
import { ChevronUp } from "lucide-react";

interface EmpathyScoreHeroProps {
  score: number; // e.g. 72.5
  onSwipeUp?: () => void;
  isExpanded?: boolean;
}

export function EmpathyScoreHero({
  score = 72.5,
  onSwipeUp,
  isExpanded = false,
}: EmpathyScoreHeroProps) {
  const displayScore = Number.isInteger(score) ? score.toFixed(1) : score.toString();

  // Circular gauge geometry
  // Start from 210 degrees to 330 degrees (approx 72.5% arc)
  const radius = 95;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Arc length for 72.5%
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference * 0.75;

  return (
    <div className="flex flex-col items-center justify-between h-full py-6 select-none animate-fade-in w-full">
      {/* Top Title: "Score" (matching Screenshot 3) */}
      <h1 className="text-base sm:text-lg font-bold text-[#281E5D] tracking-tight">
        Score
      </h1>

      {/* Neomorphic Circular Gauge */}
      <div className="relative flex items-center justify-center h-64 w-64 sm:h-72 sm:w-72 my-auto">
        {/* Embossed outer ring background */}
        <div className="absolute inset-4 rounded-full bg-[#F1EFFD] shadow-[inset_0_4px_12px_rgba(108,74,232,0.12),0_8px_20px_rgba(255,255,255,0.8)] border-[10px] border-[#E2DEFA]/70" />

        <svg className="h-full w-full -rotate-135 transform" viewBox="0 0 240 240">
          {/* Base track */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#E2DEFA"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Active purple arc */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#6C4AE8"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Number: "72.5" */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#19104A] tabular-nums font-sans">
            {displayScore}
          </span>
        </div>
      </div>

      {/* Bottom prompt: "Swipe up to see metrics ︽" */}
      <button
        type="button"
        onClick={onSwipeUp}
        aria-label="Swipe up to see metrics"
        className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#19104A] hover:text-[#6C4AE8] transition-colors cursor-pointer group py-2"
      >
        <span>{isExpanded ? "Hide metrics" : "Swipe up to see metrics"}</span>
        <span className="text-[#6C4AE8] font-bold text-base leading-none group-hover:-translate-y-1 transition-transform">
          ︽
        </span>
      </button>
    </div>
  );
}
