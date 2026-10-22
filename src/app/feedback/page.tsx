"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { DeviceContainer } from "@/components/layout/DeviceContainer";
import { EmpathyScoreHero } from "@/components/feedback/EmpathyScoreHero";
import { MetricsSheetDrawer } from "@/components/feedback/MetricsSheetDrawer";
import { PracticeReport } from "@/lib/ai/types";

export default function FeedbackPage() {
  const router = useRouter();
  const { session, report, setReport, resetSession } = useInterview();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initialize empathy practice report
  useEffect(() => {
    if (!report) {
      const fetchReport = async () => {
        try {
          const res = await fetch("/api/interview/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: session.role || "Lead Data Analyst",
              questions: session.questions && session.questions.length > 0 ? session.questions : [],
            }),
          });
          const data = await res.json();
          if (data.success && data.report) {
            setReport(data.report);
          }
        } catch {
          // ignore
        }
      };
      fetchReport();
    }
  }, [report, session.role, session.questions, setReport]);

  const activeReport: PracticeReport = report || {
    overallScore: 72.5,
    finalScore: 72.5,
    focusLevel: 93,
    averageResponseTimeSec: 8.3,
    peerMedianDelta: 11,
    competencyConfidence: 85,
    strongestArea: {
      title: "Data Quality & Validation Frameworks",
      score: 92,
      description: "Exceptional accuracy in cross-referencing and reproducible pipelines.",
    },
    biggestOpportunity: {
      title: "Pipeline Resilience & Distributed Triage",
      score: 64,
      description: "Opportunity to detail automated quarantine buckets.",
      questionId: "q2",
    },
    recommendedAction: {
      title: "Refine Pipeline Recovery & Flaky Triage",
      description: "Review telemetry protocols to ensure release pipelines remain unblocked.",
      targetQuestionId: "q2",
    },
    coachObservation:
      "Your responses demonstrated strong analytical composure, high accuracy, and calm communication under pressure.",
    evaluatedAnswers: session.questions || [],
  };

  const handleRetake = () => {
    resetSession();
    router.push("/");
  };

  return (
    <DeviceContainer defaultMode="mobile" allowToggle={true}>
      <div className="flex-1 flex flex-col justify-between bg-[#F1EFFD] text-[#19104A] min-h-full relative overflow-hidden">
        {/* Top Header bar with Retake button */}
        <div className="px-6 pt-4 pb-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-2xs font-bold uppercase tracking-wider text-[#5F588A]">
              Interview Completed
            </span>
          </div>

          <button
            type="button"
            onClick={handleRetake}
            className="flex items-center gap-1.5 text-xs font-bold text-[#6C4AE8] hover:text-[#5B3BD4] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Practice</span>
          </button>
        </div>

        {/* Circular Score Gauge Hero (matching Screenshot 3 - Left) */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <EmpathyScoreHero
            score={activeReport.finalScore ?? activeReport.overallScore ?? 72.5}
            onSwipeUp={() => setIsDrawerOpen(true)}
            isExpanded={isDrawerOpen}
          />
        </div>

        {/* Slide-Up Metrics Sheet Drawer (matching Screenshot 3 - Right) */}
        <MetricsSheetDrawer
          report={activeReport}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onRetakePractice={handleRetake}
        />
      </div>
    </DeviceContainer>
  );
}
