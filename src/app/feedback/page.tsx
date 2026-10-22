"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, ListFilter, ChevronDown, ChevronUp } from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { OverallScoreCard } from "@/components/feedback/OverallScoreCard";
import { KeyInsightsCard } from "@/components/feedback/KeyInsightsCard";
import { RecommendedActionCard } from "@/components/feedback/RecommendedActionCard";
import { EvaluatedAnswerCard } from "@/components/feedback/EvaluatedAnswerCard";
import { InterviewQuestion } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

export default function FeedbackPage() {
  const router = useRouter();
  const { session, report, setReport, setFocusedData, resetSession } = useInterview();

  const [filterMode, setFilterMode] = useState<"all" | "priority">("all");
  const [expandAllRemaining, setExpandAllRemaining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Compile report if not yet generated
  useEffect(() => {
    if (!report) {
      const fetchReport = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/interview/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: session.role || "Senior QA Automation Engineer",
              questions: session.questions && session.questions.length > 0 ? session.questions : [
                { id: "q1", prompt: "Selenium vs Playwright evaluation criteria", topic: "Selenium vs Playwright evaluation criteria" },
                { id: "q2", prompt: "“Your resume mentions Selenium automation. How would you design a test automation framework for a web application with frequent UI changes?”", topic: "Test automation with dynamic UI" },
                { id: "q3", prompt: "CI/CD Flaky test triage", topic: "CI/CD Flaky test triage" },
                { id: "q4", prompt: "Behavioral: Disagreement with Lead Architect", topic: "Behavioral: Disagreement with Lead Architect" },
                { id: "q5", prompt: "Cross-browser load strategy", topic: "Cross-browser load strategy" },
              ],
            }),
          });
          const data = await res.json();
          if (data.success && data.report) {
            setReport(data.report);
          }
        } catch {
          // ignore
        } finally {
          setIsLoading(false);
        }
      };
      fetchReport();
    }
  }, [report, session.role, session.questions, setReport]);

  const fallbackQuestions: InterviewQuestion[] = [
    {
      id: "q1",
      prompt: "Selenium vs Playwright evaluation criteria",
      topic: "Selenium vs Playwright evaluation criteria",
      skillTags: ["Automation Frameworks", "Protocol Architecture"],
      answer: "Evaluated CDP WebSocket connection vs traditional WebDriver HTTP JSON wire protocol.",
      timeSpentFormatted: "1m 58s",
      evaluation: {
        score: 88,
        statusTag: "Solid Execution",
        strengths: ["Clear comparative matrix highlighting bi-directional CDP protocols."],
        missingDetails: ["Could touch briefly on legacy browser constraints."],
        improvementSuggestions: ["Provide concrete execution speed benchmarks."],
        evidence: ["Bi-directional CDP protocols"],
        keyTakeaway: "Clear comparative matrix highlighting bi-directional CDP protocols, native auto-waiting mechanics, and browser context isolation tradeoffs.",
        technicalDepth: 92,
        clarity: 86,
      },
    },
    {
      id: "q2",
      prompt: "“How would you design a test automation framework for a web application with frequent UI changes?”",
      topic: "Test automation with dynamic UI",
      skillTags: ["Technical Architecture", "Automated Testing"],
      answer: "Focused primarily on structuring tests with the Page Object Model, abstracting DOM element locators using stable data-testid tags, and running regression runs nightly.",
      timeSpentFormatted: "2m 14s spoken",
      evaluation: {
        score: 62,
        statusTag: "Needs Attention",
        strengths: ["Good structural separation using Page Object Model and reliable resilient locator strategies."],
        missingDetails: ["Did not address automated test retry policies, failure quarantine buckets, or shadow DOM."],
        improvementSuggestions: ["Detail how CI/CD pipelines handle false positives and isolate flaky tests into quarantine."],
        evidence: ["Focused on POM and data-testid tags"],
      },
    },
    {
      id: "q3",
      prompt: "CI/CD Flaky test triage",
      topic: "CI/CD Flaky test triage",
      skillTags: ["CI/CD Pipelines", "Failure Triage"],
      answer: "Tag intermittent tests to quarantine bucket so developers are not blocked.",
      timeSpentFormatted: "2m 05s",
      evaluation: { score: 78, strengths: ["Pipeline awareness"], missingDetails: ["Add metrics"], improvementSuggestions: ["Include SLA"], evidence: ["Quarantine bucket"] },
    },
    {
      id: "q4",
      prompt: "Behavioral: Disagreement with Lead Architect on Test Coverage vs Delivery",
      topic: "Behavioral: Disagreement with Lead Architect",
      skillTags: ["Stakeholder Management", "Risk Assessment"],
      answer: "Held risk matrix review with architect.",
      timeSpentFormatted: "2m 30s",
      evaluation: { score: 81, strengths: ["Clear STAR format"], missingDetails: ["Add post-delivery tracking"], improvementSuggestions: ["Telemetry"], evidence: ["Risk review"] },
    },
    {
      id: "q5",
      prompt: "Cross-browser load strategy & high-frequency FinTech data simulation",
      topic: "Cross-browser load strategy",
      skillTags: ["Performance Testing", "Scale & Concurrency"],
      answer: "Headless execution clusters simulating high concurrency.",
      timeSpentFormatted: "1m 45s",
      evaluation: { score: 71, strengths: ["Understands distributed concurrency"], missingDetails: ["Memory leak monitoring"], improvementSuggestions: ["Memory profiling"], evidence: ["Headless clusters"] },
    },
  ];

  const questions: InterviewQuestion[] =
    session.questions && session.questions.length > 0
      ? session.questions
      : report?.evaluatedAnswers && report.evaluatedAnswers.length > 0
      ? report.evaluatedAnswers
      : fallbackQuestions;

  // Identify weakest question
  const weakestIndex =
    questions.findIndex((q) => (q.evaluation?.score ?? 70) < 70) >= 0
      ? questions.findIndex((q) => (q.evaluation?.score ?? 70) < 70)
      : 1;

  const weakestQuestion = questions[weakestIndex] || questions[1] || questions[0];

  const handleFixWeakestAnswer = async () => {
    try {
      const res = await fetch("/api/interview/focused-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          role: session.role,
          weakQuestion: weakestQuestion,
          evaluation: weakestQuestion?.evaluation || { score: 62, missingDetails: ["Address quarantine and flakiness triage."] },
        }),
      });

      const data = await res.json();
      if (data.success && data.focusedData) {
        setFocusedData(data.focusedData);
      }
    } catch {
      // fallback handled in practice page
    }
    router.push("/practice");
  };

  const handleNewSession = () => {
    resetSession();
    router.push("/");
  };

  const filteredQuestions =
    filterMode === "priority"
      ? questions.filter((q, idx) => idx === weakestIndex || (q.evaluation?.score ?? 70) < 75)
      : questions;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 transition-colors">
      {/* Top Session Completed Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-surface-blue px-3 py-1 text-xs font-bold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Session Completed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Here's where you can improve.
          </h1>
          <p className="mt-1 text-sm sm:text-base text-text-secondary">
            Your practice report is based on the 5 answers you gave during this session.
          </p>
        </div>

        {/* Duration pill card */}
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs shadow-2xs self-start md:self-auto">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-bold text-text">
            Session Duration: 18m 42s • SDET L5 Rehearsal
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (~35%) */}
        <div className="lg:col-span-5 space-y-5">
          <OverallScoreCard
            score={report?.overallScore || 76}
            peerMedianDelta={report?.peerMedianDelta || 11}
            competencyConfidence={report?.competencyConfidence || 76}
          />

          <KeyInsightsCard
            strongestArea={
              report?.strongestArea || {
                title: "Test Architecture & Locator Strategies",
                score: 90,
                description:
                  "Excellent structural decoupling, resilient selector principles, and clean domain isolation.",
              }
            }
            biggestOpportunity={
              report?.biggestOpportunity || {
                title: "CI/CD Failure Handling & Flaky Triage",
                score: 58,
                description:
                  "Gaps identified around quarantine workflows, distributed queue retries, and non-blocking pipelines.",
              }
            }
          />

          <RecommendedActionCard
            title={report?.recommendedAction?.title || "Turn your 62 into an 85+"}
            description={
              report?.recommendedAction?.description ||
              "Rehearse Question 2 using the structured STAR template and recommended pipeline recovery terminology."
            }
            coachObservation={
              report?.coachObservation ||
              "Your technical foundations are in the 88th percentile. Focusing your next session on orchestration and failure containment will unlock senior SDET criteria."
            }
            onFixWeakestAnswer={handleFixWeakestAnswer}
            onNewSession={handleNewSession}
          />
        </div>

        {/* Right Column (~65%) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Row and Filters */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-base font-bold text-text">Evaluated Answers</h2>
              <p className="text-xs text-text-muted">5 Questions Total from Practice Loop</p>
            </div>

            <div className="flex items-center rounded-lg border border-border bg-surface-muted/50 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={cn(
                  "rounded-md px-3 py-1 transition-all",
                  filterMode === "all"
                    ? "bg-surface text-primary shadow-xs"
                    : "text-text-muted hover:text-text"
                )}
              >
                All (5)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("priority")}
                className={cn(
                  "rounded-md px-3 py-1 transition-all",
                  filterMode === "priority"
                    ? "bg-surface text-primary shadow-xs"
                    : "text-text-muted hover:text-text"
                )}
              >
                Priority (1)
              </button>
            </div>
          </div>

          {/* Render Questions */}
          {filterMode === "priority" ? (
            <EvaluatedAnswerCard
              key={weakestQuestion?.id || "weakest"}
              question={weakestQuestion}
              index={weakestIndex}
              isWeakest={true}
            />
          ) : (
            <div className="space-y-4">
              {/* Highlighted Weakest Answer */}
              {weakestQuestion && (
                <EvaluatedAnswerCard
                  key={weakestQuestion.id || `weakest-${weakestIndex}`}
                  question={weakestQuestion}
                  index={weakestIndex}
                  isWeakest={true}
                />
              )}

              {/* Second Evaluated Question */}
              {questions
                .map((q, idx) => ({ q, idx }))
                .filter(({ idx }) => idx !== weakestIndex)
                .slice(0, 1)
                .map(({ q, idx }) => (
                  <EvaluatedAnswerCard
                    key={q.id || `other-${idx}`}
                    question={q}
                    index={idx}
                    isWeakest={false}
                  />
                ))}

              {/* Remaining Answers Collapsible Block */}
              {questions.length > 2 && (
                <div className="rounded-card border border-border bg-surface p-4 shadow-xs transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-text">
                      <ListFilter className="h-4 w-4 text-primary" />
                      <span>
                        {questions.length - 2} Other Answers Logged:{" "}
                        {questions
                          .map((q, idx) => ({ q, idx }))
                          .filter(({ idx }) => idx !== weakestIndex)
                          .slice(1)
                          .map(({ q, idx }) => `Q${idx + 1} (${q.evaluation?.score ?? 75}%)`)
                          .join(" • ")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandAllRemaining(!expandAllRemaining)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
                    >
                      <span>{expandAllRemaining ? "Collapse Answers" : "Expand All Answers"}</span>
                      {expandAllRemaining ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {expandAllRemaining && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-border">
                      {questions
                        .map((q, idx) => ({ q, idx }))
                        .filter(({ idx }) => idx !== weakestIndex)
                        .slice(1)
                        .map(({ q, idx }) => (
                          <EvaluatedAnswerCard
                            key={q.id || `remaining-${idx}`}
                            question={q}
                            index={idx}
                            isWeakest={false}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
