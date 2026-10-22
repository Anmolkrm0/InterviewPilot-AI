import React from "react";
import { Wrench, Info } from "lucide-react";

interface KeyPoint {
  id: number;
  title: string;
  detail: string;
}

interface SkillFocusCardProps {
  skillTitle: string;
  category: string;
  whyNeededWork: string;
  keyPoints: KeyPoint[];
}

export function SkillFocusCard({
  skillTitle = "CI/CD Pipeline Triage & Flaky Test Management",
  category = "System Health & Reliability",
  whyNeededWork = "Your previous answer explained Page Objects well, but skipped how to maintain test stability when builds fail in automated deployment pipelines.",
  keyPoints = [
    {
      id: 1,
      title: "Quarantine",
      detail: "Mention automatic retries with quarantine (quarantine suite vs blocking build).",
    },
    {
      id: 2,
      title: "Root-Cause",
      detail: "Breakdown: infra vs app bug vs stale locator before re-running.",
    },
    {
      id: 3,
      title: "Governance",
      detail: "Propose an SLA for fixing or pruning flaky tests to avoid alert fatigue.",
    },
  ],
}: SkillFocusCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-xs transition-colors space-y-4">
      {/* Skill and Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Wrench className="h-4 w-4" />
          <span className="text-2xs font-extrabold uppercase tracking-wider text-text-muted">
            Skill in Focus
          </span>
        </div>
        <span className="rounded-md bg-surface-muted px-2.5 py-0.5 text-2xs font-semibold text-text-secondary self-start sm:self-auto border border-border">
          {category}
        </span>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-text">{skillTitle}</h2>

      {/* Why Previous Needed Work Info Box */}
      <div className="rounded-xl border border-primary/20 bg-surface-blue/50 p-4 transition-colors">
        <div className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-text font-bold">Why your previous answer needed work: </strong>
            <span>{whyNeededWork}</span>
          </div>
        </div>
      </div>

      {/* Key Points to Remember (3 horizontal cards) */}
      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">
          Key Points to Remember
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {keyPoints.map((pt) => (
            <div
              key={pt.id}
              className="rounded-xl border border-border bg-surface-muted/30 p-3.5 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                  {pt.id}
                </span>
                <span className="text-xs font-bold text-text">{pt.title}</span>
              </div>
              <p className="text-2xs sm:text-xs text-text-secondary leading-normal">{pt.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
