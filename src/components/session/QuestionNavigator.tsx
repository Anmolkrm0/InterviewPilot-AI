import React from "react";
import { ListOrdered, CheckCircle2, Target } from "lucide-react";
import { InterviewQuestion } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  questions: InterviewQuestion[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  onSelectIndex,
}: QuestionNavigatorProps) {
  const answeredCount = questions.filter((q) => !!q.answer).length;

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-text">Navigator</h3>
        </div>
        <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-text-muted">
          {answeredCount}/{questions.length} Done
        </span>
      </div>

      <div className="space-y-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = !!q.answer;
          const isUpcoming = !isCurrent && !isAnswered;

          return (
            <div
              key={q.id || idx}
              onClick={() => onSelectIndex(idx)}
              className={cn(
                "flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer border",
                isCurrent
                  ? "border-primary/40 bg-surface-blue/70 text-text shadow-2xs font-semibold"
                  : isAnswered
                  ? "border-border/60 bg-surface-muted/40 text-text-secondary hover:bg-surface-muted"
                  : "border-transparent bg-transparent text-text-muted hover:bg-surface-muted/30"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {isAnswered ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : isCurrent ? (
                  <Target className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-muted text-2xs font-bold text-text-muted">
                    {idx + 1}
                  </span>
                )}

                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("font-medium", isCurrent ? "text-primary" : "text-text")}>
                      Q{idx + 1} • {isAnswered ? "Answered" : isCurrent ? "Current" : "Upcoming"}
                    </span>
                    {isAnswered && q.timeSpentFormatted && (
                      <span className="text-2xs text-text-muted">({q.timeSpentFormatted})</span>
                    )}
                  </div>
                  <p className="truncate text-2xs text-text-muted mt-0.5">{q.topic}</p>
                </div>
              </div>

              {isCurrent && (
                <span className="shrink-0 rounded-md bg-primary px-1.5 py-0.5 text-2xs font-bold text-white uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
