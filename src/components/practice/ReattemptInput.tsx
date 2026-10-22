"use client";

import React, { useState } from "react";
import { Clock, Edit3, Sparkles, Check, CheckCircle2, CircleDashed, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReattemptInputProps {
  questionPrompt: string;
  initialText?: string;
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export function ReattemptInput({
  questionPrompt,
  initialText = "First, I inspect the failure logs and video artifacts in our CI runner to determine if it's an infrastructure timeout or genuine assertion mismatch. I immediately tag intermittent tests to a quarantine bucket so developers aren't blocked, then run 50 headless iterations locally...",
  onSubmit,
  isLoading,
}: ReattemptInputProps) {
  const [text, setText] = useState(initialText);
  const [draftSaved, setDraftSaved] = useState(false);

  const starOutlineTemplate =
    "[Situation]: In our CI/CD pull request pipeline...\n[Task]: When intermittent test failures occurred without clear error causes...\n[Action]: I isolated the failing tests into a quarantined suite, inspected CI runner logs and video artifacts, and established a 48-hour SLA for root-cause resolution...\n[Result]: PR release gates stayed unblocked and flakiness was reduced to under 1.5%.";

  const handleInsertStar = () => {
    setText((prev) => (prev ? `${prev}\n\n${starOutlineTemplate}` : starOutlineTemplate));
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Real-time concept detection
  const hasQuarantine = /quarantine|isolate|bucket|non-blocking/i.test(text);
  const hasRootCause = /root[- ]?cause|log|video|artifact|runner|inspect/i.test(text);
  const hasSla = /sla|hour|day|ticket|metric|resolution/i.test(text);

  return (
    <div className="space-y-4">
      {/* Targeted Question Card */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-text">New Targeted Question</span>
          <span>• ~2 min drill</span>
        </div>
        <p className="text-base sm:text-lg font-bold text-text leading-snug">
          “{questionPrompt.replace(/^["“”]|["“”]$/g, "")}”
        </p>
      </div>

      {/* Re-attempt Textarea Card */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary" />
            <h3 className="text-xs sm:text-sm font-bold text-text">Your Re-attempt</h3>
          </div>

          <button
            type="button"
            onClick={handleInsertStar}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted/60 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-blue transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Insert STAR outline</span>
          </button>
        </div>

        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Craft your improved answer incorporating quarantine protocols, root-cause diagnostics, and SLAs..."
          className="w-full rounded-xl border border-border bg-surface p-3.5 text-xs sm:text-sm text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary/40 leading-relaxed transition-colors resize-y"
        />

        {/* Dynamic Concept Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold border transition-all",
              hasQuarantine
                ? "bg-success-surface text-success border-success/30 shadow-2xs"
                : "bg-surface-muted text-text-muted border-border"
            )}
          >
            {hasQuarantine ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
            <span>Quarantine mentioned</span>
          </span>

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold border transition-all",
              hasRootCause
                ? "bg-success-surface text-success border-success/30 shadow-2xs"
                : "bg-surface-muted text-text-muted border-border"
            )}
          >
            {hasRootCause ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
            <span>Root-cause logs</span>
          </span>

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold border transition-all",
              hasSla
                ? "bg-success-surface text-success border-success/30 shadow-2xs"
                : "bg-surface-muted text-text-muted border-border"
            )}
          >
            {hasSla ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
            <span>{hasSla ? "SLA metric included" : "Needs SLA metric"}</span>
          </span>
        </div>

        {/* Word Count Info */}
        <div className="flex items-center justify-between text-2xs text-text-muted pt-1">
          <div>
            <span>Ideal length: 70–120 words</span>
            <span className="mx-2">|</span>
            <span className={cn("font-bold", words >= 70 ? "text-success" : "text-text")}>
              {words} words
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
          >
            {draftSaved ? (
              <span className="inline-flex items-center gap-1 text-success">
                <Check className="h-3.5 w-3.5" /> Saved Draft
              </span>
            ) : (
              "Save Draft"
            )}
          </button>

          <button
            type="button"
            disabled={isLoading || !text.trim()}
            onClick={() => onSubmit(text)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Evaluating Retry...</span>
              </>
            ) : (
              <>
                <span>Submit Improved Answer</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
