import React from "react";

interface PercentageProgressBarProps {
  percentage: number; // e.g. 10, 20, 30, 100
}

export function PercentageProgressBar({ percentage }: PercentageProgressBarProps) {
  const clamped = Math.max(5, Math.min(100, percentage));

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs font-bold text-text-secondary w-9 text-right tabular-nums">
        {percentage}%
      </span>
    </div>
  );
}
