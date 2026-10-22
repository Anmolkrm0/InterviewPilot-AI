"use client";

import React from "react";
import { X, CheckCircle2, AlertCircle, FileText, Clock, Volume2 } from "lucide-react";
import { InterviewQuestion } from "@/lib/ai/types";

interface TranscriptViewerDialogProps {
  question: InterviewQuestion | null;
  questionIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function TranscriptViewerDialog({
  question,
  questionIndex,
  isOpen,
  onClose,
}: TranscriptViewerDialogProps) {
  if (!isOpen || !question) return null;

  const evaluation = question.evaluation;
  const answer = question.answer || "No response recorded.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-light">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-surface-blue px-2.5 py-0.5 text-xs font-bold text-primary">
                Question {questionIndex + 1}
              </span>
              {question.isFollowUp && (
                <span className="rounded-full bg-[#f3f0ff] px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Follow up
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#1E1B4B] leading-snug">
              {question.prompt}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-text-muted hover:bg-surface-muted hover:text-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5">
          {/* Candidate Transcript Box */}
          <div className="rounded-2xl bg-[#F8F7FD] p-4 border border-border/80">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <FileText className="h-3.5 w-3.5" />
                <span>Your Answer Transcript</span>
              </span>
              {question.timeSpentFormatted && (
                <span className="flex items-center gap-1 text-xs text-text-muted font-mono">
                  <Clock className="h-3 w-3" />
                  <span>{question.timeSpentFormatted}</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-text leading-relaxed whitespace-pre-wrap italic">
              "{answer}"
            </p>
          </div>

          {/* Metric Ratings if evaluated */}
          {evaluation && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Accuracy</span>
                <p className="text-lg font-extrabold text-emerald-800">{evaluation.accuracy ?? 45}%</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200/60 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Depth</span>
                <p className="text-lg font-extrabold text-blue-800">{evaluation.depth ?? 25}%</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Relevance</span>
                <p className="text-lg font-extrabold text-amber-800">{evaluation.relevance ?? 17}%</p>
              </div>
            </div>
          )}

          {/* Strengths */}
          {evaluation?.strengths && evaluation.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Key Strengths</span>
              </h4>
              <ul className="space-y-1.5">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-text leading-relaxed pl-5 relative before:absolute before:left-1 before:top-1.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500">
                    {str}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement Suggestions */}
          {evaluation?.improvementSuggestions && evaluation.improvementSuggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span>Opportunity to Elevate</span>
              </h4>
              <ul className="space-y-1.5">
                {evaluation.improvementSuggestions.map((sug, idx) => (
                  <li key={idx} className="text-xs text-text leading-relaxed pl-5 relative before:absolute before:left-1 before:top-1.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary">
                    {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
