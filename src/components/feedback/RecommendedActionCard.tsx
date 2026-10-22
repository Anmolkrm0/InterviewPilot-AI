"use client";

import React from "react";
import { Zap, Download, RotateCcw, Bot } from "lucide-react";

interface RecommendedActionCardProps {
  title?: string;
  description?: string;
  coachObservation?: string;
  onFixWeakestAnswer: () => void;
  onNewSession: () => void;
}

export function RecommendedActionCard({
  title = "Turn your 62 into an 85+",
  description = "Rehearse Question 2 using the structured STAR template and recommended pipeline recovery terminology.",
  coachObservation = "Your technical foundations are in the 88th percentile. Focusing your next session on orchestration and failure containment will unlock senior SDET criteria.",
  onFixWeakestAnswer,
  onNewSession,
}: RecommendedActionCardProps) {
  const handleDownloadPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Recommended Action Card */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
        <span className="inline-block rounded-md bg-surface-blue px-2.5 py-0.5 text-2xs font-extrabold uppercase tracking-wider text-primary mb-2">
          Recommended Action
        </span>
        <h3 className="text-base font-bold text-text">{title}</h3>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed">{description}</p>

        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            onClick={onFixWeakestAnswer}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-primary-hover transition-all transform active:scale-[0.99]"
          >
            <span>Fix My Weakest Answer (Q2)</span>
            <Zap className="h-4 w-4 fill-white" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2 px-3 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onNewSession}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2 px-3 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Coach Observation Card */}
      <div className="rounded-card border border-primary/20 bg-surface-blue/50 p-5 transition-colors">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-primary shadow-2xs">
            <Bot className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider">AI Coach Observation</h4>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">{coachObservation}</p>
      </div>
    </div>
  );
}
