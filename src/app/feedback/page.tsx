"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { DeviceContainer } from "@/components/layout/DeviceContainer";
import { EmpathyScoreHero } from "@/components/feedback/EmpathyScoreHero";
import { MetricsSheetDrawer } from "@/components/feedback/MetricsSheetDrawer";
import { TranscriptViewerDialog } from "@/components/feedback/TranscriptViewerDialog";
import { InterviewQuestion, PracticeReport } from "@/lib/ai/types";

export default function FeedbackPage() {
  const router = useRouter();
  const { session, report, setReport, resetSession, setFocusedData } = useInterview();

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedTranscriptQ, setSelectedTranscriptQ] = useState<{
    q: InterviewQuestion;
    idx: number;
  } | null>(null);

  // Fetch or generate empathy report if not present
  useEffect(() => {
    if (!report) {
      const fetchReport = async () => {
        try {
          const res = await fetch("/api/interview/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: session.role || "Lead Data Analyst",
              questions:
                session.questions && session.questions.length > 0
                  ? session.questions
                  : [
                      {
                        id: "q1",
                        prompt:
                          "Can you walk me through a data project you've worked on, from problem definition to actionable insights?",
                        topic: "Data Project Walkthrough",
                        skillTags: ["Data Architecture", "Actionable Insights"],
                        isFollowUp: false,
                        answer:
                          "Built an automated ETL pipeline transforming customer transaction logs, applied anomaly detection, and exposed an interactive dashboard that reduced churn by 14%.",
                        evaluation: {
                          score: 87,
                          accuracy: 45,
                          depth: 25,
                          relevance: 17,
                          strengths: ["Strong problem framing and structured ETL synthesis."],
                          missingDetails: ["Could articulate more quantifiable outcomes."],
                          improvementSuggestions: ["Cite concrete cost savings."],
                        },
                      },
                      {
                        id: "q2",
                        prompt:
                          "What challenges did you face during that project, and how did you overcome them?",
                        topic: "Project Challenges & Overcoming Roadblocks",
                        skillTags: ["Problem Solving", "Resilience"],
                        isFollowUp: true,
                        answer:
                          "Faced upstream schema drift which caused nightly pipeline stalls. Implemented schema registry contracts with automated quarantine alerts.",
                        evaluation: {
                          score: 100,
                          accuracy: 50,
                          depth: 30,
                          relevance: 20,
                          strengths: ["Outstanding resilience and concrete root-cause quarantine."],
                          missingDetails: [],
                          improvementSuggestions: ["Exemplary response."],
                        },
                      },
                      {
                        id: "q3",
                        prompt:
                          "How do you ensure data quality and accuracy in your analysis?",
                        topic: "Data Quality & Validation Frameworks",
                        skillTags: ["Validation Checks", "Version Control"],
                        isFollowUp: false,
                        answer:
                          "Automated validation checks using Great Expectations, staging vs production parity tests, and Git-versioned data pipelines.",
                        evaluation: {
                          score: 85,
                          accuracy: 42,
                          depth: 26,
                          relevance: 17,
                          strengths: ["Comprehensive validation methodology and test parity."],
                          missingDetails: ["Mention automated alert thresholds."],
                          improvementSuggestions: ["Detail CI/CD data testing gates."],
                        },
                      },
                    ],
            }),
          });
          const data = await res.json();
          if (data.success && data.report) {
            setReport(data.report);
          }
        } catch {
          // handled
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

  const handleStartFocusedDrill = async () => {
    try {
      const weakQ =
        activeReport.evaluatedAnswers.find((q) => (q.evaluation?.score ?? 80) < 75) ||
        activeReport.evaluatedAnswers[0];
      if (weakQ) {
        const res = await fetch("/api/interview/focused-practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate",
            role: session.role || "Lead Data Analyst",
            weakQuestion: weakQ,
            evaluation: weakQ.evaluation || { score: 64, missingDetails: ["Add quarantine metrics"] },
          }),
        });
        const data = await res.json();
        if (data.success && data.focusedData) {
          setFocusedData(data.focusedData);
        }
      }
    } catch {
      // ignore
    }
    router.push("/practice");
  };

  return (
    <DeviceContainer defaultMode="mobile" allowToggle={true}>
      <div className="flex-1 flex flex-col justify-between bg-[#F7F6FD] text-[#1E1B4B] min-h-full">
        {/* Top Header */}
        <div className="px-5 pt-4 pb-1 sm:px-8 sm:pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Interview Complete
            </span>
          </div>

          <button
            type="button"
            onClick={handleRetake}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Session</span>
          </button>
        </div>

        {/* Circular Score Gauge Hero (72.5) */}
        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <EmpathyScoreHero
            score={activeReport.finalScore ?? activeReport.overallScore ?? 72.5}
            onSwipeUp={() => setIsDrawerOpen(!isDrawerOpen)}
            isExpanded={isDrawerOpen}
          />
        </div>

        {/* Expandable Metrics Bottom Sheet Drawer (Focus Level 93%, Avg Response 8.3s, Accuracy/Depth/Relevance Bars) */}
        <div className="w-full mt-auto">
          <MetricsSheetDrawer
            report={activeReport}
            isOpen={isDrawerOpen}
            onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
            onRetakePractice={handleRetake}
            onStartFocusedDrill={handleStartFocusedDrill}
          />
        </div>
      </div>
    </DeviceContainer>
  );
}
