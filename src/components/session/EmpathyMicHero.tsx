"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTechnicalSpeech } from "@/lib/technical-speech-formatter";

interface EmpathyMicHeroProps {
  onTranscript: (newText: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export function EmpathyMicHero({
  onTranscript,
  isListening,
  setIsListening,
}: EmpathyMicHeroProps) {
  const [seconds, setSeconds] = useState(0);
  const [interimText, setInterimText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let currentFinal = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentFinal += transcript;
            } else {
              currentInterim += transcript;
            }
          }

          setInterimText(currentInterim);

          if (currentFinal.trim()) {
            const formatted = formatTechnicalSpeech(currentFinal.trim());
            onTranscript(formatted);
            setInterimText("");
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech error:", event.error);
          if (event.error === "not-allowed") {
            setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
          }
          setIsListening(false);
          setInterimText("");
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimText("");
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onTranscript, setIsListening]);

  const toggleListening = () => {
    setErrorMessage(null);
    if (!recognitionRef.current) {
      setErrorMessage("Speech recognition not supported in this browser. Please use text typing below.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setInterimText("");
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      try {
        setSeconds(0);
        recognitionRef.current.start();
        setIsListening(true);
        timerRef.current = setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: unknown) {
        setIsListening(false);
        const msg = err instanceof Error ? err.message : "Could not start microphone.";
        setErrorMessage(msg);
      }
    }
  };

  const formattedTimer = `${Math.floor(seconds / 60)}:${
    seconds % 60 < 10 ? "0" : ""
  }${seconds % 60}`;

  return (
    <div className="flex flex-col items-center justify-center my-6 sm:my-8 select-none">
      {/* Hero Circular Mic Button with Concentric Animated Ripple Waves */}
      <div className="relative flex items-center justify-center h-44 w-44 sm:h-52 sm:w-52">
        {isListening && (
          <>
            <div className="absolute h-40 w-40 sm:h-48 sm:w-48 rounded-full bg-primary/20 animate-ripple-1 pointer-events-none" />
            <div className="absolute h-40 w-40 sm:h-48 sm:w-48 rounded-full bg-primary/15 animate-ripple-2 pointer-events-none" />
            <div className="absolute h-40 w-40 sm:h-48 sm:w-48 rounded-full bg-primary/10 animate-ripple-3 pointer-events-none" />
          </>
        )}

        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? "Stop speaking" : "Tap to speak"}
          className={cn(
            "relative z-10 flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 transform active:scale-95 cursor-pointer",
            isListening
              ? "bg-primary shadow-primary/30 scale-105"
              : "bg-primary hover:bg-primary-hover hover:scale-105"
          )}
        >
          {isListening ? (
            <Mic className="h-12 w-12 sm:h-14 sm:w-14 animate-pulse stroke-[2.2]" />
          ) : (
            <Mic className="h-12 w-12 sm:h-14 sm:w-14 stroke-[2.2]" />
          )}
        </button>
      </div>

      {/* Subtext Status & Timer */}
      <div className="mt-4 text-center h-8">
        {isListening ? (
          <div className="flex items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-text">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Listening...
            </span>
            <span className="font-mono text-text-muted tabular-nums">{formattedTimer}</span>
          </div>
        ) : (
          <p className="text-xs sm:text-sm font-medium text-text-muted">
            Tap on the microphone to speak
          </p>
        )}
      </div>

      {/* Live Interim Speech Preview */}
      {isListening && interimText && (
        <div className="mt-2 flex items-center gap-2 max-w-sm rounded-xl bg-surface-muted/90 px-3.5 py-1.5 text-xs text-text border border-border shadow-xs animate-fade-in">
          <Volume2 className="h-3.5 w-3.5 text-primary shrink-0 animate-bounce" />
          <span className="italic truncate">"{interimText}"</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 text-xs text-danger max-w-xs text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
