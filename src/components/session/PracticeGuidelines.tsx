import React from "react";
import { Lightbulb, CheckCircle2, Sliders } from "lucide-react";

export function PracticeGuidelines() {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-text">Practice Guidelines</h3>
      </div>

      <div className="space-y-3 text-xs leading-relaxed">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-text-secondary">
            Structure your response with the <strong className="text-text font-semibold">STAR format</strong>{" "}
            (Situation, Task, Action, Result) for clarity.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-text-secondary">
            Highlight <strong className="text-text font-semibold">concrete tools and engineering trade-offs</strong>{" "}
            rather than generic theoretical definitions.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-text-secondary">
            <strong className="text-text font-semibold">Stress-free rehearsal:</strong> No score penalties or
            interruptions occur mid-session to avoid test anxiety.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-text-muted" />
          <span>Interviewer Strictness</span>
        </div>
        <span className="font-semibold text-text">Senior / Pragmatic</span>
      </div>
    </div>
  );
}
