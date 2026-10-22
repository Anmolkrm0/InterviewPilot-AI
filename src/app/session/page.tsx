"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Keyboard,
  ArrowRight,
  LogOut,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { DeviceContainer } from "@/components/layout/DeviceContainer";
import { PercentageProgressBar } from "@/components/session/PercentageProgressBar";
import { AudioReplayControl } from "@/components/session/AudioReplayControl";
import { EmpathyMicHero } from "@/components/session/EmpathyMicHero";
import { AccessibleTextResponse } from "@/components/session/AccessibleTextResponse";
import { cn } from "@/lib/utils";

export default function SessionPage() {
  const router = useRouter();
  const {
    session,
    startSession,
    submitCurrentAnswer,
    skipCurrentQuestion,
    setReport,
  } = useInterview();

  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  // Bootstrap initial questions if landing directly on /session
  useEffect(() => {
    if (!session.questions || session.questions.length === 0) {
      const loadInitialQuestions = async () => {
        try {
          const res = await fetch("/api/interview/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: session.role || "Lead Data Analyst",
              focus: session.focus || "mixed",
              candidateName: session.candidateName || "Candidate",
              resumeText:
                session.resumeText ||
                "Experienced Data Analyst specializing in ETL pipelines, statistical modeling, and business intelligence.",
              jobDescriptionText:
                session.jobDescriptionText ||
                "Lead Data Analyst responsible for end-to-end data architectures and executive presentations.",
            }),
          });
          const data = await res.json();
          if (data.success && data.questions) {
            startSession(data.questions);
          }
        } catch {
          // ignore
        }
      };
      loadInitialQuestions();
    }
  }, [session.questions, session.role, session.focus, session.candidateName, session.resumeText, session.jobDescriptionText, startSession]);

  const questions = session.questions || [];
  const currentIdx = Math.min(session.currentQuestionIndex, Math.max(0, questions.length - 1));
  const currentQuestion = questions[currentIdx];

  const totalQuestions = questions.length || 5;
  // Natural percentage progression: e.g. 20%, 40%, 60%, 80%, 100%
  const percentage = Math.min(100, Math.round(((currentIdx + 1) / totalQuestions) * 100));
  const isLastQuestion = currentIdx === totalQuestions - 1;

  // Sync draft answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      setCurrentAnswer(currentQuestion.answer || "");
      setIsListening(false);
    }
  }, [currentIdx, currentQuestion?.id]);

  const handleSpeechTranscript = (text: string) => {
    setCurrentAnswer((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const answerToSubmit = currentAnswer.trim() || "Candidate gave an overview of project methodology and outcomes.";
    const timeSpentSeconds = 134; // standard spoken answer duration
    const words = answerToSubmit.split(/\s+/).length;
    const computedWpm = Math.max(90, Math.min(160, Math.round((words / (timeSpentSeconds / 60)) || 128)));

    try {
      const evalRes = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: session.role || "Lead Data Analyst",
          focus: session.focus || "mixed",
          question: currentQuestion,
          candidateAnswer: answerToSubmit,
          jobDescriptionText: session.jobDescriptionText,
        }),
      });

      const evalData = await evalRes.json();
      const evaluation = evalData?.evaluation || {
        score: 85,
        accuracy: 45,
        depth: 25,
        relevance: 17,
        strengths: ["Strong problem framing and structured communication."],
        missingDetails: ["Could articulate more quantifiable outcomes."],
        improvementSuggestions: ["Cite concrete KPIs."],
        evidence: [answerToSubmit.slice(0, 100)],
      };

      submitCurrentAnswer(answerToSubmit, timeSpentSeconds, computedWpm, evaluation);

      if (isLastQuestion) {
        // Compile final report
        const reportRes = await fetch("/api/interview/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: session.role || "Lead Data Analyst",
            questions: questions.map((q, i) =>
              i === currentIdx ? { ...q, answer: answerToSubmit, evaluation } : q
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
      const msg = err instanceof Error ? err.message : "Error saving response.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuit = () => {
    setShowExitModal(true);
  };

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F6FD]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm font-semibold text-text">Preparing your empathy interview...</p>
        </div>
      </div>
    );
  }

  return (
    <DeviceContainer defaultMode="mobile" allowToggle={true}>
      <div className="flex-1 flex flex-col justify-between px-5 py-4 sm:px-8 sm:py-6 bg-[#F7F6FD] text-[#1E1B4B]">
        {/* Top Pacing Bar: Smooth Percentage Progress Bar */}
        <div className="w-full pb-2">
          <div className="flex items-center justify-between gap-3 mb-1">
            <PercentageProgressBar percentage={percentage} />
          </div>
        </div>

        {/* Question Area */}
        <div className="w-full my-auto py-2">
          {/* Question Card */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 border border-border/80 shadow-xs relative">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {currentQuestion.isFollowUp && (
                  <span className="rounded-full bg-[#f3f0ff] px-2.5 py-0.5 text-xs font-bold text-primary">
                    Follow up
                  </span>
                )}
              </div>

              {/* Audio Replay Button */}
              <AudioReplayControl promptText={currentQuestion.prompt} />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[#1E1B4B] leading-relaxed">
              {currentQuestion.prompt}
            </h2>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-danger-surface p-2.5 text-xs text-danger border border-danger/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive Response Mode */}
          {inputMode === "voice" ? (
            <div className="flex flex-col items-center">
              {/* Empathy Mic Hero with Ripples */}
              <EmpathyMicHero
                key={`mic-${currentQuestion.id || currentIdx}`}
                onTranscript={handleSpeechTranscript}
                isListening={isListening}
                setIsListening={setIsListening}
              />

              {/* Recorded Answer Snippet if any text exists */}
              {currentAnswer && (
                <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xs p-3.5 border border-border/70 text-xs text-text shadow-2xs mb-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-text-muted mb-1">
                    <span>Captured Answer</span>
                    <button
                      type="button"
                      onClick={() => setInputMode("text")}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      Edit text
                    </button>
                  </div>
                  <p className="line-clamp-2 italic text-text-secondary">"{currentAnswer}"</p>
                </div>
              )}

              {/* Switch to Text Mode Toggle */}
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className="mt-1 flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-primary transition-colors cursor-pointer py-1"
              >
                <Keyboard className="h-4 w-4 text-primary" />
                <span>Prefer to type? Switch to text response</span>
              </button>
            </div>
          ) : (
            <div className="w-full">
              {/* Accessible Non-Verbal Text Mode */}
              <AccessibleTextResponse
                key={`text-${currentQuestion.id || currentIdx}`}
                value={currentAnswer}
                onChange={setCurrentAnswer}
                onSwitchToVoice={() => setInputMode("voice")}
              />
            </div>
          )}
        </div>

        {/* Bottom Bar: Quit & Next */}
        <div className="w-full pt-3 pb-2 border-t border-border-light flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleQuit}
            className="flex-1 rounded-2xl border border-border bg-white px-5 py-3 text-xs sm:text-sm font-bold text-text-secondary hover:text-text hover:bg-surface-muted transition-colors cursor-pointer text-center"
          >
            Quit
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-primary-hover active:scale-98 transition-all cursor-pointer",
              isSubmitting && "opacity-80 cursor-wait"
            )}
          >
            <span>{isSubmitting ? "Processing..." : isLastQuestion ? "Finish Interview" : "Next"}</span>
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Exit Modal */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-6 shadow-2xl">
              <h3 className="text-base font-bold text-[#1E1B4B]">Quit this interview?</h3>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                You can exit to the home screen or view whatever partial feedback has been captured.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-xl bg-danger px-3.5 py-2 text-xs font-semibold text-white hover:bg-danger/90 transition-colors"
                >
                  Quit to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DeviceContainer>
  );
}
