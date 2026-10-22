import React from "react";
import { CheckCircle2, Flag } from "lucide-react";

interface KeyInsightsCardProps {
  strongestArea: {
    title: string;
    score: number;
    description: string;
  };
  biggestOpportunity: {
    title: string;
    score: number;
    description: string;
  };
}

export function KeyInsightsCard({
  strongestArea,
  biggestOpportunity,
}: KeyInsightsCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
      <div className="mb-3 flex items-center justify-between text-xs">
        <h3 className="font-bold text-text text-sm">Key Insights</h3>
        <span className="text-text-muted">2 Focus Vectors</span>
      </div>

      <div className="space-y-3">
        {/* Strongest Area */}
        <div className="rounded-xl border border-success/20 bg-success-surface/50 p-3.5 transition-colors">
          <div className="flex items-center gap-1.5 text-xs font-bold text-success mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>Strongest Area ({strongestArea?.score || 90}%)</span>
          </div>
          <p className="text-xs font-bold text-text">
            {strongestArea?.title || "Test Architecture & Locator Strategies"}
          </p>
          <p className="mt-1 text-xs text-text-secondary leading-normal">
            {strongestArea?.description ||
              "Excellent structural decoupling, resilient selector principles, and clean domain isolation."}
          </p>
        </div>

        {/* Biggest Opportunity */}
        <div className="rounded-xl border border-warning/20 bg-warning-surface/50 p-3.5 transition-colors">
          <div className="flex items-center gap-1.5 text-xs font-bold text-warning mb-1">
            <Flag className="h-4 w-4" />
            <span>Biggest Opportunity ({biggestOpportunity?.score || 58}%)</span>
          </div>
          <p className="text-xs font-bold text-text">
            {biggestOpportunity?.title || "CI/CD Failure Handling & Flaky Triage"}
          </p>
          <p className="mt-1 text-xs text-text-secondary leading-normal">
            {biggestOpportunity?.description ||
              "Gaps identified around quarantine workflows, distributed queue retries, and non-blocking pipelines."}
          </p>
        </div>
      </div>
    </div>
  );
}
