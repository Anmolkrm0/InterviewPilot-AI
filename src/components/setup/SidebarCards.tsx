import React from "react";
import { CheckCircle2, PlayCircle, Target, ShieldCheck } from "lucide-react";

interface SidebarCardsProps {
  candidateName: string;
  competencies: string[];
}

export function SidebarCards({ candidateName, competencies }: SidebarCardsProps) {
  const displayCompetencies =
    competencies.length > 0
      ? competencies.slice(0, 4)
      : ["Selenium Webdriver", "CI/CD Automation", "API Load & Test", "STAR Scenarios"];

  return (
    <div className="space-y-4">
      {/* 1. Simulation Engine Card */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">Simulation Engine</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-surface px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Active
          </span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Synthesizing persona for{" "}
          <strong className="text-text font-semibold">{candidateName || "Alex Chen"}</strong>.
          Questions cross-reference automation frameworks with high-frequency FinTech domain constraints.
        </p>

        <div className="mt-3.5 rounded-xl border border-border bg-surface-muted/40 p-3">
          <p className="mb-2 text-xs font-semibold text-text-muted">Mapped Competencies</p>
          <div className="flex flex-wrap gap-1.5">
            {displayCompetencies.map((comp) => (
              <span
                key={comp}
                className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-text border border-border shadow-2xs"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interview Architecture Card */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
        <h3 className="mb-3.5 text-sm font-semibold text-text">Interview Architecture</h3>

        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-surface text-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-text">1. Resume & JD Synthesis</p>
              <p className="text-xs text-text-muted">Complete • 8 competencies mapped</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-blue text-primary">
              <PlayCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-text">2. 5 Live Scenario Questions</p>
              <p className="text-xs text-text-muted">Dynamic pacing • Audio or text responses</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-secondary">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-text">3. Actionable Score & Drill</p>
              <p className="text-xs text-text-muted">Immediate evaluation & weak-answer drill</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Privacy Protected Card */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-text">Privacy Protected</h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Your resume contains personal information. We process it only in-session to synthesize tailored
          questions and never sell your profile data.
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-success font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Zero permanent storage without explicit export</span>
        </div>
      </div>
    </div>
  );
}
