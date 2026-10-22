import React from "react";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { FocusedEvaluationResult } from "@/lib/ai/types";

interface ComparisonCardProps {
  result?: FocusedEvaluationResult | null;
}

export function ComparisonCard({ result }: ComparisonCardProps) {
  const originalScore = result?.originalScore ?? 58;
  const reattemptScore = result?.reattemptScore ?? 89;
  const delta = result?.scoreDelta ?? 31;
  const whatChanged =
    result?.whatChanged ??
    "Added specific quarantine protocol that unblocks feature teams without silently passing defective code.";
  const conceptsAdded = result?.conceptsAdded ?? [
    "Root-cause triage differentiating infra vs test code",
    "Definite SLA metrics (e.g., 48-hour fix-or-drop quarantine cycle)",
  ];

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI Evaluated
        </span>
        <span className="text-2xs text-text-muted">Updated 2m ago</span>
      </div>

      {/* Comparison Score Row */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/30 p-3.5">
        <div className="text-center">
          <span className="block text-2xs font-extrabold uppercase tracking-wider text-text-muted">
            Original
          </span>
          <div className="mt-0.5 text-lg sm:text-xl font-black text-text-muted">
            {originalScore}
            <span className="text-xs font-normal">/100</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="rounded-full bg-success-surface px-2.5 py-0.5 text-xs font-extrabold text-success border border-success/30 shadow-2xs">
            +{delta} pts
          </span>
          <ArrowRight className="h-4 w-4 text-text-muted mt-1" />
        </div>

        <div className="text-center">
          <span className="block text-2xs font-extrabold uppercase tracking-wider text-primary">
            Re-Attempt
          </span>
          <div className="mt-0.5 text-lg sm:text-xl font-black text-success">
            {reattemptScore}
            <span className="text-xs font-normal">/100</span>
          </div>
        </div>
      </div>

      {/* What Changed */}
      <div>
        <p className="text-2xs font-extrabold uppercase tracking-wider text-text-muted mb-1.5">
          What Changed
        </p>
        <div className="rounded-xl border border-border bg-surface-muted/30 p-3 text-xs text-text-secondary leading-relaxed">
          {whatChanged}
        </div>
      </div>

      {/* Concepts Added */}
      <div>
        <p className="text-2xs font-extrabold uppercase tracking-wider text-text-muted mb-1.5">
          Concepts Added
        </p>
        <div className="space-y-1.5">
          {conceptsAdded.map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-success-surface/40 p-2 text-xs text-text leading-tight border border-success/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drill Reliability Sparkline */}
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <div>
          <span className="block text-2xs text-text-muted">Drill Reliability</span>
          <span className="text-xs font-bold text-text">Top 12% Candidate</span>
        </div>

        {/* SVG Sparkline */}
        <div className="w-24 h-7">
          <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
            <path
              d="M 5 22 Q 35 24 50 15 T 95 6"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="95" cy="6" r="3" fill="var(--primary)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
