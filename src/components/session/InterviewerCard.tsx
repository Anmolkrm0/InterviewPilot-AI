"use client";

import React, { useState, useEffect } from "react";
import { Bot, Volume2, VolumeX, Lightbulb } from "lucide-react";
import { InterviewQuestion } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface InterviewerCardProps {
  question: InterviewQuestion;
}

export function InterviewerCard({ question }: InterviewerCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasTtsSupport, setHasTtsSupport] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setHasTtsSupport(true);
    }
  }, []);

  const handleToggleTts = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.prompt);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-xs transition-colors">
      {/* Interviewer Persona Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text">AI Interviewer</span>
              <span className="rounded-md bg-surface-blue px-2 py-0.5 text-2xs font-bold text-primary uppercase tracking-wider">
                Lead Persona
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {question.personaTitle || "Senior Staff SDET & Systems Architect"}
            </p>
          </div>
        </div>

        {hasTtsSupport && (
          <button
            type="button"
            onClick={handleToggleTts}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold transition-all hover:bg-surface-muted self-start sm:self-auto",
              isPlayingAudio ? "border-primary bg-surface-blue text-primary animate-pulse" : "text-text-secondary"
            )}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="h-4 w-4 text-primary" />
                <span>Pause Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-primary" />
                <span>Listen Prompt</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Question Statement */}
      <div className="mb-5">
        <p className="text-base sm:text-lg font-bold text-text leading-relaxed tracking-tight">
          “{question.prompt.replace(/^["“”]|["“”]$/g, "")}”
        </p>
      </div>

      {/* Target Focal Points */}
      <div className="rounded-xl border border-primary/15 bg-surface-blue/50 p-4 transition-colors">
        <div className="flex items-start gap-2.5">
          <div className="rounded-lg bg-surface p-1 text-primary shadow-2xs mt-0.5">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Target focal points</p>
            <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-normal">
              {question.targetFocalPoints ||
                "Speak to component-based locators, Page Object Model (POM), or resilient wait strategies."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
