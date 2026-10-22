import React from "react";

interface PacingAnalysisProps {
  wpm?: number;
}

export function PacingAnalysis({ wpm = 128 }: PacingAnalysisProps) {
  // Height heights for the 8 visual bars in optimal range
  const barHeights = ["h-3", "h-5", "h-4", "h-7", "h-9", "h-8", "h-7", "h-9"];

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold tracking-wider text-text-muted uppercase text-2xs">
          PACING ANALYSIS
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-success text-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          In Optimal Range
        </span>
      </div>

      <div className="my-2 flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-text">{wpm}</span>
        <span className="text-xs text-text-muted font-medium">words per minute baseline</span>
      </div>

      {/* Visual Equalizer Bars */}
      <div className="mt-3 flex items-end gap-1.5 h-10 pt-1">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className={`flex-1 ${h} rounded-sm bg-primary/80 transition-all hover:bg-primary`}
          />
        ))}
      </div>
    </div>
  );
}
