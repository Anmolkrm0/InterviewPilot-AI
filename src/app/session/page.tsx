"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  LogOut,
  Clock,
  Code2,
  AlertCircle,
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { formatClock } from "@/lib/utils";
import { InterviewerCard } from "@/components/session/InterviewerCard";
import { ResponseInput } from "@/components/session/ResponseInput";
import { QuestionNavigator } from "@/components/session/QuestionNavigator";
import { PracticeGuidelines } from "@/components/session/PracticeGuidelines";
import { PacingAnalysis } from "@/components/session/PacingAnalysis";

export default function SessionPage() {
  const router = useRouter();
  const {
    session,
    startSession,
    submitCurrentAnswer,
    skipCurrentQuestion,
    setCurrentQuestionIndex,
    setReport,
  } = useInterview();

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  // Fallback bootstrap if user lands directly on /session without questions
  useEffect(() => {
    if (!session.questions || session.questions.length === 0) {
      const loadInitialQuestions = async () => {
        try {
          const res = await fetch("/api/interview/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: session.role || "Senior QA Automation Engineer",
              focus: session.focus || "mixed",
              candidateName: session.candidateName || "Alex Chen",
              resumeText:
                session.resumeText ||
                "Alex Chen - Senior QA Automation Engineer with Selenium, Playwright, CI/CD, and Microservices API testing.",
              jobDescriptionText:
                session.jobDescriptionText ||
                "Senior QA Automation Engineer with Selenium, Playwright, and CI/CD pipelines.",
            }),
          });
          const data = await res.json();
          if (data.success && data.questions) {
            startSession(data.questions);
          }
        } catch {
          // handled
        }
      };
      loadInitialQuestions();
    }
  }, [session.questions, session.role, session.focus, session.candidateName, session.resumeText, session.jobDescriptionText, startSession]);

  const questions = session.questions || [];
  const currentIdx = Math.min(session.currentQuestionIndex, Math.max(0, questions.length - 1));
  const currentQuestion = questions[currentIdx];

  const totalQuestions = questions.length || 5;
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);
  const isLastQuestion = currentIdx === totalQuestions - 1;

  const handleSubmitAnswer = async (answer: string) => {
    if (!currentQuestion) return;

    setIsEvaluating(true);
    setErrorMessage(null);

    const timeSpentSeconds = 134; // ~2m 14s spoken
    const words = answer.trim().split(/\s+/).length;
    const computedWpm = Math.max(90, Math.min(160, Math.round((words / (timeSpentSeconds / 60)) || 128)));

    try {
      const evalRes = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: session.role,
          focus: session.focus,
          question: currentQuestion,
          candidateAnswer: answer,
          jobDescriptionText: session.jobDescriptionText,
        }),
      });

      const evalData = await evalRes.json();
      if (!evalRes.ok || !evalData.success) {
        throw new Error(evalData.error || "Failed to evaluate answer.");
      }

      submitCurrentAnswer(answer, timeSpentSeconds, computedWpm, evalData.evaluation);

      // If it was the last question, generate the final report and proceed to feedback
      if (isLastQuestion) {
        const reportRes = await fetch("/api/interview/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: session.role,
            questions: questions.map((q, i) =>
              i === currentIdx ? { ...q, answer, evaluation: evalData.evaluation } : q
            ),
          }),
        });

        const reportData = await reportRes.json();
        if (reportData.success && reportData.report) {
          setReport(reportData.report);
        }
        router.push("/feedback");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error evaluating answer.";
      setErrorMessage(msg);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSkip = () => {
    if (isLastQuestion) {
      router.push("/feedback");
    } else {
      skipCurrentQuestion();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm font-semibold text-text">Loading mock interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7 transition-colors">
      {/* Top Session Status Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-text">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE MOCK SESSION {formatClock(session.elapsedSeconds || 525)}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-surface-blue px-2.5 py-1 text-xs font-medium text-primary">
            <Mic className="h-3.5 w-3.5" />
            <span>Mic Active • 44.1kHz</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExitModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text transition-colors self-start sm:self-auto"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit Practice</span>
        </button>
      </div>

      {/* Exit Practice Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-bold text-text">Exit Practice Session?</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Your draft answers are saved in your browser session. You can return to the setup screen or
              jump to your current practice metrics.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
              >
                Keep Practicing
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white hover:bg-danger/90 transition-colors"
              >
                Exit to Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-danger-surface p-3 text-xs text-danger border border-danger/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Progress Indicator Card */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-white">
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <span className="text-text-muted">•</span>
                <span className="flex items-center gap-1 text-text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  Est. 3 min remaining
                </span>
              </div>
              <span className="text-primary font-bold">{progressPercent}% Complete</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Skill / Topic Tags */}
            <div className="mt-3.5 flex items-center gap-2 flex-wrap">
              {(currentQuestion.skillTags || ["Technical Architecture", "Automated Testing"]).map(
                (tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary border border-border/60"
                  >
                    <Code2 className="h-3 w-3 text-primary" />
                    <span>{tag}</span>
                  </span>
                )
              )}
            </div>
          </div>

          {/* AI Interviewer Card */}
          <InterviewerCard question={currentQuestion} />

          {/* Candidate Response Card */}
          <ResponseInput
            initialAnswer={currentQuestion.answer || ""}
            isLastQuestion={isLastQuestion}
            role={session.role}
            questionTopic={currentQuestion.topic}
            onSubmit={handleSubmitAnswer}
            onSkip={handleSkip}
            isLoading={isEvaluating}
          />
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-4">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIdx}
            onSelectIndex={(idx) => setCurrentQuestionIndex(idx)}
          />

          <PracticeGuidelines />

          <PacingAnalysis wpm={currentQuestion.pacingWpm || 128} />
        </div>
      </div>
    </div>
  );
}
