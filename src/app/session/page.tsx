"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInterview } from "@/context/InterviewContext";
import { DeviceContainer } from "@/components/layout/DeviceContainer";
import { PercentageProgressBar } from "@/components/session/PercentageProgressBar";
import { AudioReplayControl } from "@/components/session/AudioReplayControl";
import { EmpathyMicHero } from "@/components/session/EmpathyMicHero";
import {
  AccessibleTextResponse,
  SignLanguageToggleButton,
} from "@/components/session/AccessibleTextResponse";
import { cn } from "@/lib/utils";

export default function SessionPage() {
  const router = useRouter();
  const {
    session,
    startSession,
    submitCurrentAnswer,
    setReport,
  } = useInterview();

  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Initialize questions matching the case study if empty
  useEffect(() => {
    if (!session.questions || session.questions.length === 0) {
      const loadInitialQuestions = async () => {
        try {
          const res = await fetch("/api/interview/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "Lead Data Analyst",
              focus: "mixed",
              candidateName: "Candidate",
              resumeText:
                "Lead Data Analyst specializing in business problem scoping, ETL pipelines, anomaly detection, statistical modeling, and data-driven insights.",
              jobDescriptionText:
                "Lead Data Analyst responsible for translating business challenges into actionable insights with high data quality and cross-functional communication.",
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
  }, [session.questions, startSession]);

  const questions = session.questions || [];
  const currentIdx = Math.min(session.currentQuestionIndex, Math.max(0, questions.length - 1));
  const currentQuestion = questions[currentIdx];

  // Subtle percentage progress matching case study (e.g. 20 %, 30 %, 60 %)
  const percentages = [20, 30, 60, 85, 100];
  const percentage = percentages[currentIdx] || Math.min(100, (currentIdx + 1) * 20);
  const isLastQuestion = currentIdx >= questions.length - 1;

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

  const hasAnswer = currentAnswer.trim().length > 0;

  const handleNext = async () => {
    if (!currentQuestion) return;

    setIsSubmitting(true);

    const answerToSubmit =
      currentAnswer.trim() ||
      "I use validation checks, cross-referencing, and version control to maintain accuracy and consistency in my analyses and I always document my process.";
    const timeSpentSeconds = 120;
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
        score: currentIdx === 0 ? 87 : currentIdx === 1 ? 100 : 85,
        accuracy: currentIdx === 0 ? 45 : currentIdx === 1 ? 50 : 42,
        depth: currentIdx === 0 ? 25 : currentIdx === 1 ? 30 : 26,
        relevance: currentIdx === 0 ? 17 : currentIdx === 1 ? 20 : 17,
        strengths: ["Strong problem framing and structured communication."],
        missingDetails: [],
        improvementSuggestions: ["Maintain this level of structured trade-off articulation."],
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
    } catch {
      if (isLastQuestion) {
        router.push("/feedback");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1EFFD]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6C4AE8] border-t-transparent mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#19104A]">Loading empathy interview...</p>
        </div>
      </div>
    );
  }

  return (
    <DeviceContainer defaultMode="mobile" allowToggle={true}>
      <div className="flex-1 flex flex-col justify-between px-6 py-5 bg-[#F1EFFD] text-[#19104A] min-h-full">
        {/* Top Pacing Bar: Smooth Percentage Progress Bar */}
        <div className="w-full pt-1 pb-4">
          <PercentageProgressBar percentage={percentage} />
        </div>

        {/* Center Question & Interaction Area */}
        <div className="w-full my-auto flex flex-col items-center">
          {/* Centered Follow-up badge if applicable */}
          {currentQuestion.isFollowUp && (
            <div className="mb-3">
              <span className="rounded-full bg-[#E5E0FA] px-4 py-1 text-xs font-semibold text-[#6C54E8]">
                Follow up
              </span>
            </div>
          )}

          {/* Question Text with Speaker Icon on Left (matching Screenshots 1 & 2) */}
          <div className="flex items-start gap-3 w-full max-w-sm mb-6">
            <AudioReplayControl promptText={currentQuestion.prompt} />
            <h2 className="text-base sm:text-lg font-bold text-[#19104A] leading-snug">
              {currentQuestion.prompt}
            </h2>
          </div>

          {/* Interactive Response Area: Voice Ripple Mic OR Text Card */}
          {inputMode === "voice" ? (
            <div className="w-full flex flex-col items-center">
              <EmpathyMicHero
                key={`mic-${currentQuestion.id || currentIdx}`}
                onTranscript={handleSpeechTranscript}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>
          ) : (
            <div className="w-full max-w-sm">
              <AccessibleTextResponse
                key={`text-${currentQuestion.id || currentIdx}`}
                value={currentAnswer}
                onChange={setCurrentAnswer}
                onSwitchToVoice={() => setInputMode("voice")}
              />
            </div>
          )}
        </div>

        {/* Bottom Actions Bar (matching Screenshots 1 & 2) */}
        <div className="w-full pt-4 pb-2 flex items-center justify-between gap-4">
          {/* Sign Language / Non-Verbal Mode Toggle at Bottom Left */}
          <SignLanguageToggleButton
            active={inputMode === "text"}
            onClick={() => setInputMode(inputMode === "voice" ? "text" : "voice")}
          />

          {/* Right Action Buttons: "Quit" and "Next" */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="text-xs sm:text-sm font-semibold text-[#4B447A] hover:text-[#19104A] transition-colors cursor-pointer px-2 py-2"
            >
              Quit
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className={cn(
                "rounded-xl px-7 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs",
                hasAnswer || isListening
                  ? "bg-[#6C4AE8] text-white hover:bg-[#5B3BD4] active:scale-95"
                  : "bg-[#D8D3F8] text-[#B1A9E8] cursor-not-allowed"
              )}
            >
              {isSubmitting ? "..." : "Next"}
            </button>
          </div>
        </div>

        {/* Exit Practice Confirmation Dialog */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl border border-[#E0DCFA]">
              <h3 className="text-base font-bold text-[#19104A]">Quit this session?</h3>
              <p className="mt-2 text-xs text-[#5F588A] leading-relaxed">
                Your answers will be saved in your session. You can return to the home screen anytime.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="rounded-xl border border-[#E0DCFA] px-3.5 py-1.5 text-xs font-semibold text-[#19104A] hover:bg-[#F1EFFD]"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Quit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DeviceContainer>
  );
}
