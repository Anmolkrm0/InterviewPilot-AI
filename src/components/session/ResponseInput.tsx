"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Edit3,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  SkipForward,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseInputProps {
  initialAnswer?: string;
  isLastQuestion: boolean;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function ResponseInput({
  initialAnswer = "",
  isLastQuestion,
  onSubmit,
  onSkip,
  isLoading,
}: ResponseInputProps) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setAnswer(initialAnswer);
  }, [initialAnswer]);

  // Speech Recognition initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setHasSpeechSupport(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setAnswer((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const characters = answer.length;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-xs transition-colors">
      {/* Response Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-text">Your Response</h2>
        </div>

        {hasSpeechSupport && (
          <button
            type="button"
            onClick={toggleListening}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border",
              isListening
                ? "bg-danger-surface text-danger border-danger/30 animate-pulse"
                : "bg-surface-muted text-text-secondary border-border hover:bg-surface-blue hover:text-primary"
            )}
          >
            {isListening ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                <span>Listening... Click to Stop</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-success" />
                <Mic className="h-3.5 w-3.5 text-primary" />
                <span>Voice Dictation Ready</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Answer Textarea */}
      <div className="relative">
        <textarea
          rows={7}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Speak or type your structured technical response here..."
          className="w-full rounded-xl border border-border bg-surface p-4 text-sm sm:text-base text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary/40 leading-relaxed transition-colors resize-y"
        />
      </div>

      {/* Word / Char Counter & Draft Status */}
      <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
        <div>
          <span>{words} words</span>
          <span className="mx-2">•</span>
          <span>Character count: {characters}</span>
        </div>

        <div className="flex items-center gap-1.5 text-success font-medium">
          <CheckCircle2 className="h-4 w-4" />
          <span>Auto-saved draft</span>
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isLoading || !answer.trim()}
            onClick={() => onSubmit(answer)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Evaluating Response...</span>
              </>
            ) : (
              <>
                <span>{isLastQuestion ? "Finish Interview" : "Submit Answer"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-3 text-xs sm:text-sm font-semibold text-text-secondary hover:bg-surface-muted hover:text-text transition-colors"
          >
            <SkipForward className="h-4 w-4" />
            <span>Skip Question</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBookmarked(!isBookmarked)}
            aria-label="Bookmark Question"
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface transition-colors",
              isBookmarked
                ? "bg-surface-blue text-primary border-primary/30"
                : "text-text-muted hover:text-text hover:bg-surface-muted"
            )}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 fill-primary/20" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className="text-2xs sm:text-xs text-text-muted sm:max-w-xs sm:text-right">
          Answers are saved locally. You can review all evaluations in your final report.
        </p>
      </div>
    </div>
  );
}
