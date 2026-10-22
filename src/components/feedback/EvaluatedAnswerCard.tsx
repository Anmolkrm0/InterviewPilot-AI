"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Key,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";
import { InterviewQuestion } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface EvaluatedAnswerCardProps {
  question: InterviewQuestion;
  index: number;
  isWeakest?: boolean;
}

export function EvaluatedAnswerCard({
  question,
  index,
  isWeakest = false,
}: EvaluatedAnswerCardProps) {
  const [isExpanded, setIsExpanded] = useState(isWeakest || index === 1);
  const [isStarExampleOpen, setIsStarExampleOpen] = useState(true);
  const [hasCopiedStar, setHasCopiedStar] = useState(false);

  if (!question) return null;

  const evaluation = question.evaluation;
  const score = evaluation?.score ?? 70;
  const isNeedsAttention = score < 75;

  const handleCopyStar = () => {
    const textToCopy =
      evaluation?.improvedAnswerExample?.starOutlineText ||
      `[Situation]: In a high-frequency trading portal...\n[Task]: Needed to design an automated test framework resilient to DOM shifts...\n[Action]: Decoupled locator catalogs from execution steps and enforced quarantine retries...\n[Result]: Flaky build failures reduced by 74%.`;

    navigator.clipboard.writeText(textToCopy);
    setHasCopiedStar(true);
    setTimeout(() => setHasCopiedStar(false), 2000);
  };

  // If card is collapsed
  if (!isExpanded) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text">Question {index + 1} of 5</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-2xs font-bold border",
                isNeedsAttention
                  ? "bg-warning-surface text-warning border-warning/20"
                  : "bg-success-surface text-success border-success/20"
              )}
            >
              • {isNeedsAttention ? "Needs Attention" : "Solid Execution"} • {score}/100
            </span>
          </div>
          <span className="flex items-center gap-1 text-2xs text-text-muted">
            <Clock className="h-3 w-3" />
            {question.timeSpentFormatted || "1m 58s"}
          </span>
        </div>

        <h4 className="mt-2 text-sm font-bold text-text">{question.topic}</h4>

        {evaluation?.keyTakeaway && (
          <div className="mt-3 rounded-xl border border-border bg-surface-muted/50 p-3 text-xs leading-normal">
            <div className="flex items-start gap-2">
              <Key className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-text-secondary">
                <strong className="text-text font-semibold uppercase text-2xs tracking-wider">Key Takeaway: </strong>
                {evaluation.keyTakeaway}
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-text-muted text-2xs">
            <span>Technical Depth: {evaluation?.technicalDepth ?? 92}%</span>
            <span>•</span>
            <span>Clarity: {evaluation?.clarity ?? 86}%</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-semibold text-xs transition-colors"
          >
            <span>View Response Transcript</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded View
  return (
    <div
      className={cn(
        "rounded-card border bg-surface p-6 shadow-xs transition-colors space-y-4",
        isWeakest ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
      )}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-text">Question {index + 1} of 5</span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-2xs font-bold border",
              isNeedsAttention
                ? "bg-warning-surface text-warning border-warning/20"
                : "bg-success-surface text-success border-success/20"
            )}
          >
            • {isNeedsAttention ? "Needs Attention" : "Solid Execution"} • {score}/100
          </span>
          {isWeakest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-blue px-2.5 py-0.5 text-2xs font-bold text-primary border border-primary/20">
              <Star className="h-3 w-3 fill-primary/20" />
              RECOMMENDED FOCUS
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-xs text-text-muted hover:text-text self-end sm:self-auto"
        >
          Collapse Card ▴
        </button>
      </div>

      {/* Question Prompt */}
      <div>
        <p className="text-base sm:text-lg font-bold text-text leading-snug">
          “{question.prompt.replace(/^["“”]|["“”]$/g, "")}”
        </p>
      </div>

      {/* Candidate Stated Approach */}
      <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
        <div className="mb-1.5 flex items-center justify-between text-2xs">
          <span className="font-bold uppercase tracking-wider text-text-muted">
            Candidate's Stated Approach
          </span>
          <span className="flex items-center gap-1 text-text-muted">
            <Clock className="h-3 w-3" />
            {question.timeSpentFormatted || "2m 14s spoken"}
          </span>
        </div>
        <p className="text-xs sm:text-sm italic text-text leading-relaxed">
          “
          {question.answer ||
            "Focused primarily on structuring tests with the Page Object Model, abstracting DOM element locators using stable data-testid tags, and running regression runs nightly."}
          ”
        </p>
      </div>

      {/* Strengths Box */}
      <div className="rounded-xl border border-success/25 bg-success-surface/40 p-4">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>Strengths</span>
        </div>
        <div className="space-y-1 text-xs text-text-secondary leading-relaxed">
          {evaluation?.strengths?.map((s, i) => (
            <p key={i}>{s}</p>
          )) || (
            <p>
              Good structural separation using Page Object Model and reliable resilient locator strategies
              with data-testid.
            </p>
          )}
        </div>
      </div>

      {/* Missing Details Box */}
      <div className="rounded-xl border border-danger/25 bg-danger-surface/40 p-4">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-danger">
          <XCircle className="h-4 w-4" />
          <span>Missing Details</span>
        </div>
        <div className="space-y-1 text-xs text-text-secondary leading-relaxed">
          {evaluation?.missingDetails?.map((m, i) => (
            <p key={i}>{m}</p>
          )) || (
            <p>
              Did not address automated test retry policies, failure quarantine buckets, or handling
              asynchronous shadow DOM elements and micro-frontend rendering shifts.
            </p>
          )}
        </div>
      </div>

      {/* How to Improve Box */}
      <div className="rounded-xl border border-primary/20 bg-surface-blue/40 p-4">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-primary">
          <Compass className="h-4 w-4" />
          <span>How to Improve</span>
        </div>
        <div className="space-y-1 text-xs text-text-secondary leading-relaxed">
          {evaluation?.improvementSuggestions?.map((s, i) => (
            <p key={i}>{s}</p>
          )) || (
            <p>
              Detail how CI/CD pipelines handle false positives and how flaky tests are isolated into
              quarantine without halting critical pull-request deployment gates.
            </p>
          )}
        </div>
      </div>

      {/* Collapsible Example of Stronger Answer (STAR Framework) */}
      <div className="rounded-xl border border-primary/20 bg-surface-muted/30 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsStarExampleOpen(!isStarExampleOpen)}
          className="flex w-full items-center justify-between p-3.5 text-xs font-bold text-text hover:bg-surface-muted/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Example of a Stronger Answer (STAR Framework)</span>
          </div>
          {isStarExampleOpen ? (
            <ChevronUp className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          )}
        </button>

        {isStarExampleOpen && (
          <div className="p-4 pt-1 border-t border-border/60 space-y-3 text-xs leading-relaxed">
            <div className="rounded-lg bg-surface p-3 border border-border">
              <strong className="text-primary font-bold">Architecture & Resilience: </strong>
              <span className="text-text-secondary">
                “I decouple locator catalogs from execution steps via autonomous Page Component models. Locators default to custom semantic telemetry attributes (
                <code className="rounded bg-surface-muted px-1.5 py-0.5 text-primary font-mono text-2xs">data-qa</code>), backed by visual baseline snapshots for layout-shift resilience.”
              </span>
            </div>

            <div className="rounded-lg bg-surface p-3 border border-border">
              <strong className="text-primary font-bold">Pipeline Containment: </strong>
              <span className="text-text-secondary">
                “To prevent blocking pull requests, tests that fail twice in ephemeral environments are auto-flagged into a quarantine matrix via Datadog webhooks, creating a Jira ticket while keeping the deployment gate unblocked.”
              </span>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleCopyStar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text hover:bg-surface-muted transition-colors"
              >
                {hasCopiedStar ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span className="text-success">Copied Outline!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy STAR Outline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
