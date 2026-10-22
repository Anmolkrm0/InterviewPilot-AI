"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2 } from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { SkillFocusCard } from "@/components/practice/SkillFocusCard";
import { ReattemptInput } from "@/components/practice/ReattemptInput";
import { ComparisonCard } from "@/components/practice/ComparisonCard";
import { PracticeCompleteCard } from "@/components/practice/PracticeCompleteCard";
import { DeviceContainer } from "@/components/layout/DeviceContainer";

export default function FocusedPracticePage() {
  const router = useRouter();
  const { session, focusedData, setFocusedData, focusedResult, setFocusedResult } = useInterview();

  const [isLoading, setIsLoading] = useState(false);
  const [activeDrillIndex, setActiveDrillIndex] = useState(1); // Drill #2 of 3

  // Load focused drill data if not populated
  useEffect(() => {
    if (!focusedData) {
      const loadFocusedData = async () => {
        try {
          const res = await fetch("/api/interview/focused-practice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "generate",
              role: session.role || "Senior QA Automation Engineer",
              weakQuestion: {
                id: "q2",
                prompt:
                  "“Your resume mentions Selenium automation. How would you design a test automation framework for a web application with frequent UI changes?”",
                topic: "Test automation with dynamic UI",
              },
              evaluation: {
                score: 58,
                missingDetails: [
                  "Your previous answer explained Page Objects well, but skipped how to maintain test stability when builds fail in automated deployment pipelines.",
                ],
              },
            }),
          });
          const data = await res.json();
          if (data.success && data.focusedData) {
            setFocusedData(data.focusedData);
          }
        } catch {
          // handled
        }
      };
      loadFocusedData();
    }
  }, [focusedData, session.role, setFocusedData]);

  const handleSubmitRetry = async (retryAnswer: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/interview/focused-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          role: session.role,
          originalAnswer: "Focused primarily on structuring tests with the Page Object Model...",
          originalScore: focusedData?.originalScore || 58,
          retryAnswer,
          targetedQuestion:
            focusedData?.newTargetedQuestion ||
            "When automated tests fail intermittently in your pull request pipeline, what step-by-step process do you follow to isolate, triage, and resolve the flakiness without blocking releases?",
          skillInFocus: focusedData?.skillInFocus || "CI/CD Pipeline Triage & Flaky Test Management",
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setFocusedResult(data.result);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeAnother = () => {
    setActiveDrillIndex((prev) => (prev + 1) % 3);
  };

  const handleReturnToReport = () => {
    router.push("/feedback");
  };

  return (
    <DeviceContainer defaultMode="web" allowToggle={true}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 transition-colors">
        {/* Top Banner Row */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-surface-blue px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-primary">
                TARGETED DRILL #2 OF 3 • CONTINUOUS REFINEMENT MODE
              </span>
              <span className="rounded-full bg-success-surface px-2.5 py-0.5 text-xs font-bold text-success border border-success/30">
                +18% Boost
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
              Let's work on your weakest answer.
            </h1>
            <p className="mt-1 text-sm sm:text-base text-text-secondary">
              Practice the specific concepts you missed to turn this into a high-confidence answer.
            </p>
          </div>

          {/* Step Indicator Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface p-1 text-xs font-semibold shadow-2xs self-start md:self-auto">
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-text-muted">
              <Check className="h-3 w-3 text-success" />
              <span>1. Architecture</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-white shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span>2. CI/CD Triage</span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-text-muted">
              <span>3. Scalability</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (~65%) */}
          <div className="lg:col-span-7 space-y-5">
            <SkillFocusCard
              skillTitle={focusedData?.skillInFocus || "CI/CD Pipeline Triage & Flaky Test Management"}
              category={focusedData?.category || "System Health & Reliability"}
              whyNeededWork={
                focusedData?.whyPreviousNeededWork ||
                "Your previous answer explained Page Objects well, but skipped how to maintain test stability when builds fail in automated deployment pipelines."
              }
              keyPoints={
                focusedData?.keyPoints || [
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
                ]
              }
            />

            <ReattemptInput
              questionPrompt={
                focusedData?.newTargetedQuestion ||
                "“When automated tests fail intermittently in your pull request pipeline, what step-by-step process do you follow to isolate, triage, and resolve the flakiness without blocking releases?”"
              }
              onSubmit={handleSubmitRetry}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column (~35%) */}
          <div className="lg:col-span-5 space-y-5">
            <ComparisonCard result={focusedResult} />

            <PracticeCompleteCard
              onPracticeAnother={handlePracticeAnother}
              onReturnToReport={handleReturnToReport}
            />
          </div>
        </div>
      </div>
    </DeviceContainer>
  );
}
