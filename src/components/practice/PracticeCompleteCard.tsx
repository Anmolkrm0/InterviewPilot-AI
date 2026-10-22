import React from "react";
import { Flag, ArrowRight, BarChart3 } from "lucide-react";

interface PracticeCompleteCardProps {
  onPracticeAnother: () => void;
  onReturnToReport: () => void;
}

export function PracticeCompleteCard({
  onPracticeAnother,
  onReturnToReport,
}: PracticeCompleteCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-surface text-success border border-success/20">
          <Flag className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text">Focused Practice Complete</h3>
          <p className="text-xs text-text-muted">You've mastered test triage protocols</p>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">
        Ready to tackle your next opportunity area or review your comprehensive mock interview
        performance?
      </p>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onPracticeAnother}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-all"
        >
          <span>Practice Another Weak Area</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onReturnToReport}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 px-4 text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
        >
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>Return to Full Report</span>
        </button>
      </div>
    </div>
  );
}
