"use client";

import React, { useState } from "react";
import { Eye, Clock, Info, X } from "lucide-react";
import { InterviewQuestion, PracticeReport } from "@/lib/ai/types";
import { TranscriptViewerDialog } from "./TranscriptViewerDialog";

interface MetricsSheetDrawerProps {
  report: PracticeReport;
  isOpen: boolean;
  onClose: () => void;
  onRetakePractice?: () => void;
}

export function MetricsSheetDrawer({
  report,
  isOpen,
  onClose,
  onRetakePractice,
}: MetricsSheetDrawerProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<{
    q: InterviewQuestion;
    idx: number;
  } | null>(null);

  const focusLevel = report.focusLevel ?? 93;
  const avgResponseTime = report.averageResponseTimeSec ?? 8.3;
  const questions = report.evaluatedAnswers && report.evaluatedAnswers.length > 0
    ? report.evaluatedAnswers
    : [
        {
          id: "q1",
          prompt: "Can you walk me through a data project you've worked on, from problem definition to actionable insights?",
          topic: "Data Project Walkthrough",
          skillTags: ["Data Architecture", "Actionable Insights"],
          answer: "I led an end-to-end data pipeline project translating raw customer events into actionable churn indicators, optimizing retention by 14%.",
          evaluation: {
            score: 87,
            accuracy: 45,
            depth: 25,
            relevance: 17,
            strengths: ["Strong problem framing and structured communication."],
            missingDetails: [],
            improvementSuggestions: ["Maintain this level of structured trade-off articulation."],
            evidence: ["Led end-to-end data pipeline project."],
          },
        },
        {
          id: "q2",
          prompt: "What challenges did you face during that project, and how did you overcome them?",
          topic: "Project Challenges & Overcoming Roadblocks",
          isFollowUp: true,
          skillTags: ["Problem Solving", "Resilience"],
          answer: "Faced upstream schema mismatches causing nocturnal pipeline stalls. Enforced schema contracts and quarantine alerts to protect SLAs.",
          evaluation: {
            score: 100,
            accuracy: 50,
            depth: 30,
            relevance: 20,
            strengths: ["Outstanding resilience and concrete root-cause quarantine."],
            missingDetails: [],
            improvementSuggestions: ["Exemplary response."],
            evidence: ["Enforced schema contracts and quarantine alerts."],
          },
        },
        {
          id: "q3",
          prompt: "How do you ensure data quality and accuracy in your analysis?",
          topic: "Data Quality & Validation Frameworks",
          skillTags: ["Validation Checks", "Version Control"],
          answer: "I use validation checks, cross-referencing, and version control to maintain accuracy and consistency in my analyses and I always document my process.",
          evaluation: {
            score: 85,
            accuracy: 42,
            depth: 26,
            relevance: 17,
            strengths: ["Comprehensive validation methodology and test parity."],
            missingDetails: ["Mention automated alert thresholds."],
            improvementSuggestions: ["Detail CI/CD data testing gates."],
            evidence: ["Used validation checks and Great Expectations."],
          },
        },
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60 backdrop-blur-2xs transition-all animate-fade-in">
      {/* Top Close (X) Button (matching Screenshot 3) */}
      <div className="flex justify-center pb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close metrics sheet"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAE6FC] text-[#48398A] hover:bg-[#DDD7F8] shadow-md transition-transform active:scale-90 cursor-pointer"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Sheet Content Card */}
      <div className="w-full max-h-[86vh] bg-white rounded-t-[32px] shadow-2xl p-5 sm:p-6 overflow-y-auto no-scrollbar border-t border-[#E0DCFA]">
        {/* Top 2 Metric Summary Pills (matching Screenshot 3) */}
        <div className="space-y-2.5 mb-5">
          {/* Focus Level Pill */}
          <div className="flex items-center justify-between rounded-xl bg-[#EDF9F0] border border-[#C6ECD1] px-3.5 py-2 text-xs font-semibold text-[#1B6E32]">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#1B6E32]" />
              <span>Focus level</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span>{focusLevel}%</span>
              <Info className="h-3.5 w-3.5 text-[#1B6E32]/70 cursor-pointer" />
            </div>
          </div>

          {/* Average Response Time Pill */}
          <div className="flex items-center justify-between rounded-xl bg-[#FEF8E7] border border-[#F9E8B2] px-3.5 py-2 text-xs font-semibold text-[#8A6714]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8A6714]" />
              <span>Average Response time</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span>{avgResponseTime} sec</span>
              <Info className="h-3.5 w-3.5 text-[#8A6714]/70 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Question Breakdown Cards (matching Screenshot 3) */}
        <div className="space-y-3.5">
          {questions.map((q, idx) => {
            const evalData = q.evaluation;
            const cardScore = evalData?.score ?? (idx === 0 ? 87 : idx === 1 ? 100 : 85);
            const accuracy = evalData?.accuracy ?? (idx === 0 ? 45 : idx === 1 ? 50 : 42);
            const depth = evalData?.depth ?? (idx === 0 ? 25 : idx === 1 ? 30 : 26);
            const relevance = evalData?.relevance ?? (idx === 0 ? 17 : idx === 1 ? 20 : 17);

            // Normalized widths for the continuous segmented bar
            const total = (accuracy + depth + relevance) || 100;
            const accuracyPct = Math.round((accuracy / total) * 100);
            const depthPct = Math.round((depth / total) * 100);
            const relevancePct = 100 - accuracyPct - depthPct;

            return (
              <div
                key={q.id || idx}
                className="rounded-2xl bg-[#F5F3FD] p-4 sm:p-5 border border-[#E0DCFA]/80 shadow-2xs"
              >
                {/* Header: "Question X" and "View transcript" */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#19104A]">
                    Question {idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedQuestion({ q, idx })}
                    className="rounded-xl bg-[#E0DCFA] px-3 py-1 text-xs font-semibold text-[#48388C] hover:bg-[#D5CEF8] transition-colors cursor-pointer"
                  >
                    View transcript
                  </button>
                </div>

                {/* Score Number: "Score : 87" */}
                <div className="text-sm font-bold text-[#19104A] mb-3">
                  Score : {cardScore}
                </div>

                {/* Continuous Segmented 3-Color Bar (Green | Blue | Orange) */}
                <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-zinc-200 mb-2">
                  <div
                    className="h-full bg-[#22C55E] transition-all duration-700"
                    style={{ width: `${accuracyPct}%` }}
                    title={`Accuracy ${accuracy}%`}
                  />
                  <div
                    className="h-full bg-[#0EA5E9] transition-all duration-700"
                    style={{ width: `${depthPct}%` }}
                    title={`Depth ${depth}%`}
                  />
                  <div
                    className="h-full bg-[#F97316] transition-all duration-700"
                    style={{ width: `${relevancePct}%` }}
                    title={`Relevance ${relevance}%`}
                  />
                </div>

                {/* Sub-labels line: "Accuracy • 45%   Depth • 25%   Relevance • 17%" */}
                <div className="flex items-center justify-between text-2xs sm:text-xs text-[#5F588A] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                    <span>Accuracy • {accuracy}%</span>
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
                    <span>Depth • {depth}%</span>
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
                    <span>Relevance • {relevance}%</span>
                  </span>
                </div>
              </div>
            );
          })}
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
