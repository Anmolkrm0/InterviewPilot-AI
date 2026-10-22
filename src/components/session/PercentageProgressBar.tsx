"use client";

import React from "react";

interface PercentageProgressBarProps {
  percentage: number; // e.g. 10, 20, 30, 100
}

export function PercentageProgressBar({ percentage }: PercentageProgressBarProps) {
  const clamped = Math.max(5, Math.min(100, percentage));

  return (
    <div className="flex items-center gap-3 w-full px-1">
      {/* Track */}
      <div className="flex-1 h-1.5 rounded-full bg-[#E3E0F8] overflow-hidden">
        <div
          className="h-full bg-[#6C4AE8] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      {/* Percentage Text e.g. "20 %" */}
      <span className="text-xs font-bold text-[#19104A] w-12 text-right tabular-nums tracking-tight">
        {percentage} %
      </span>
    </div>
  );
}
