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
  // Format score to 1 decimal place (e.g. 72.5) or integer if exact
  const displayScore = Number.isInteger(score) ? score.toFixed(1) : score.toString();

  // SVG circular gauge geometry
  const radius = 86;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Score percentage (clamp between 0 and 100)
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4 select-none animate-fade-in">
      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center h-56 w-56">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 220 220">
          {/* Background circle track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#EDE9FE"
            strokeWidth={strokeWidth}
          />
          {/* Active progress stroke */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#6C5CE7"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content inside circular gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1E1B4B] tabular-nums font-sans">
            {displayScore}
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-text-secondary mt-1">
            Score
          </span>
        </div>
      </div>

      {/* Swipe up prompt with animated chevrons */}
      <button
        type="button"
        onClick={onSwipeUp}
        aria-label="Swipe up to see detailed metrics"
        className="mt-6 flex flex-col items-center gap-1 text-xs font-semibold text-text-secondary hover:text-primary transition-colors cursor-pointer group"
      >
        <div className="flex flex-col items-center -space-y-1 text-primary group-hover:-translate-y-0.5 transition-transform">
          <ChevronUp className="h-4 w-4" />
          <ChevronUp className="h-4 w-4 -mt-2.5 opacity-60" />
        </div>
        <span>{isExpanded ? "Hide detailed metrics" : "Swipe up to see metrics"}</span>
      </button>
    </div>
  );
}
