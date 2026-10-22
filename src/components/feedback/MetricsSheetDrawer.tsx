"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { InterviewQuestion, PracticeReport } from "@/lib/ai/types";
import { TranscriptViewerDialog } from "./TranscriptViewerDialog";
import { cn } from "@/lib/utils";

interface MetricsSheetDrawerProps {
  report: PracticeReport;
  isOpen: boolean;
  onToggle: () => void;
  onRetakePractice: () => void;
  onStartFocusedDrill?: () => void;
}

export function MetricsSheetDrawer({
  report,
  isOpen,
  onToggle,
  onRetakePractice,
  onStartFocusedDrill,
}: MetricsSheetDrawerProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<{
    q: InterviewQuestion;
    idx: number;
  } | null>(null);

  const focusLevel = report.focusLevel ?? 93;
  const avgResponseTime = report.averageResponseTimeSec ?? 8.3;
  const questions = report.evaluatedAnswers || [];

  return (
    <div
      className={cn(
        "w-full bg-white rounded-t-[36px] shadow-[0_-12px_40px_rgba(30,27,75,0.08)] border-t border-border/80 transition-all duration-500 ease-in-out flex flex-col",
        isOpen ? "max-h-[82vh] overflow-hidden" : "max-h-24 overflow-hidden"
      )}
    >
      {/* Drawer Handle & Header Bar */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full pt-3 pb-3 flex flex-col items-center justify-center cursor-pointer select-none hover:bg-surface-muted/40 transition-colors"
      >
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full mb-2" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
          <span>{isOpen ? "Detailed Breakdown" : "Tap to expand metrics"}</span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </button>

      {/* Two Metric Summary Pills */}
      <div className="px-5 pb-4 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap shrink-0 border-b border-border-light">
        {/* Focus Level Pill */}
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Focus level {focusLevel}%</span>
        </div>

        {/* Average Response Time Pill */}
        <div className="flex items-center gap-2 rounded-full bg-[#f3f0ff] px-3.5 py-1.5 border border-primary/20 text-[#1E1B4B] text-xs font-bold shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Average Response time {avgResponseTime} sec</span>
        </div>
      </div>

      {/* Scrollable Questions Breakdown & Actions (Visible when open) */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
        {questions.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted">
            No questions recorded in this session.
          </div>
        ) : (
          questions.map((q, idx) => {
            const evalData = q.evaluation;
            const accuracy = evalData?.accuracy ?? 42;
            const depth = evalData?.depth ?? 24;
            const relevance = evalData?.relevance ?? 18;

            // Normalized to percentage out of 100 for display bars
            const accuracyPercent = Math.min(100, Math.round((accuracy / 50) * 100));
            const depthPercent = Math.min(100, Math.round((depth / 30) * 100));
            const relevancePercent = Math.min(100, Math.round((relevance / 20) * 100));

            return (
              <div
                key={q.id || idx}
                className="rounded-2xl border border-border/80 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-text">
                      {idx + 1}. {q.topic || `Question ${idx + 1}`}
                    </span>
                    {q.isFollowUp && (
                      <span className="rounded-full bg-[#f3f0ff] px-2 py-0.5 text-[10px] font-bold text-primary">
                        Follow up
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedQuestion({ q, idx })}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors shrink-0 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View transcript</span>
                  </button>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">
                  {q.prompt}
                </p>

                {/* 3 Metric Bars: Accuracy (green), Depth (blue), Relevance (orange) */}
                <div className="space-y-2 pt-2 border-t border-border-light">
                  {/* Accuracy Bar */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-18 text-[11px] font-semibold text-text-secondary">
                      Accuracy
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${accuracyPercent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] font-bold text-emerald-700 tabular-nums">
                      {accuracyPercent}%
                    </span>
                  </div>

                  {/* Depth Bar */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-18 text-[11px] font-semibold text-text-secondary">
                      Depth
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${depthPercent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] font-bold text-blue-700 tabular-nums">
                      {depthPercent}%
                    </span>
                  </div>

                  {/* Relevance Bar */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-18 text-[11px] font-semibold text-text-secondary">
                      Relevance
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-700"
                        style={{ width: `${relevancePercent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] font-bold text-amber-700 tabular-nums">
                      {relevancePercent}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Coach Observation & Recommendations */}
        {report.coachObservation && (
          <div className="rounded-2xl bg-[#F8F7FD] p-4 border border-border/80">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Empathy Coach Note</span>
            </div>
            <p className="text-xs text-text leading-relaxed">
              {report.coachObservation}
            </p>
          </div>
        )}

        {/* Actions at bottom */}
        <div className="pt-2 pb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRetakePractice}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold text-text hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Practice</span>
          </button>

          {onStartFocusedDrill && (
            <button
              type="button"
              onClick={onStartFocusedDrill}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
            >
              <span>Targeted Drill</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Transcript Modal Dialog */}
      <TranscriptViewerDialog
        question={selectedQuestion?.q || null}
        questionIndex={selectedQuestion?.idx ?? 0}
        isOpen={!!selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
      />
    </div>
  );
}
