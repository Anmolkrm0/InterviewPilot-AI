import React from "react";
import { Sparkles, Calendar, TrendingUp, Info, CheckCircle2 } from "lucide-react";

interface OverallScoreCardProps {
  score: number;
  peerMedianDelta: number;
  competencyConfidence: number;
}

export function OverallScoreCard({
  score = 76,
  peerMedianDelta = 11,
  competencyConfidence = 76,
}: OverallScoreCardProps) {
  // SVG circular gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-blue px-2.5 py-0.5 font-bold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI Practice Estimate
        </span>
        <span className="flex items-center gap-1 text-text-muted">
          <Calendar className="h-3 w-3" />
          Today, 14:20
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-text">{score}</span>
            <span className="text-sm font-semibold text-text-muted">/ 100</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Above peer median (+{peerMedianDelta}%)</span>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center">
          <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              fill="transparent"
              className="text-surface-muted"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-surface-blue text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Competency Confidence Bar */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-text">Competency Confidence</span>
          <span className="text-text-muted">Target: 85+</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, competencyConfidence)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-2xs text-text-muted leading-tight">
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
        <span>Scores are practice benchmarks to guide preparation, not an endorsement or hiring prediction.</span>
      </div>
    </div>
  );
}
