"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Volume2 } from "lucide-react";
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
            setErrorMessage("Microphone access denied. Please allow mic permissions in browser.");
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
      // Fallback timer simulation for testing when speech API is unavailable
      if (!isListening) {
        setIsListening(true);
        setSeconds(0);
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      } else {
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
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
    <div className="flex flex-col items-center justify-center my-6 sm:my-10 select-none">
      {/* Concentric Waves Container */}
      <div className="relative flex items-center justify-center h-48 w-48 sm:h-56 sm:w-56">
        {/* Animated concentric ripples when listening */}
        {isListening && (
          <>
            <div className="absolute h-44 w-44 sm:h-52 sm:w-52 rounded-full bg-[#E4DFFC] animate-ripple-1 pointer-events-none" />
            <div className="absolute h-38 w-38 sm:h-46 sm:w-46 rounded-full bg-[#D5CCFB] animate-ripple-2 pointer-events-none" />
            <div className="absolute h-34 w-34 sm:h-40 sm:w-40 rounded-full bg-[#C0B4F9] animate-ripple-3 pointer-events-none" />
          </>
        )}

        {/* Hero Purple Button */}
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? "Stop listening" : "Tap on the microphone to speak"}
          className={cn(
            "relative z-10 flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer bg-[#6C4AE8] hover:bg-[#5B3BD4]",
            isListening && "scale-105 shadow-[#6C4AE8]/30"
          )}
        >
          <Mic className="h-12 w-12 sm:h-14 sm:w-14 stroke-[2.2]" />
        </button>
      </div>

      {/* Subtext: "Listening...  0:00" vs "Tap on the microphone to speak" */}
      <div className="mt-4 text-center h-8 w-full px-6">
        {isListening ? (
          <div className="flex items-center justify-between max-w-[220px] mx-auto text-sm font-semibold text-[#19104A]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6C4AE8] animate-pulse" />
              Listening...
            </span>
            <span className="font-mono text-[#5F588A] tabular-nums">{formattedTimer}</span>
          </div>
        ) : (
          <p className="text-sm font-medium text-[#4B447A]">
            Tap on the microphone to speak
          </p>
        )}
      </div>

      {/* Live Interim Speech Preview snippet */}
      {isListening && interimText && (
        <div className="mt-2 flex items-center gap-2 max-w-xs rounded-xl bg-white/90 backdrop-blur-xs px-3.5 py-1.5 text-xs text-[#19104A] border border-[#E0DCFA] shadow-xs">
          <Volume2 className="h-3.5 w-3.5 text-[#6C4AE8] shrink-0 animate-bounce" />
          <span className="italic truncate">"{interimText}"</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 text-xs text-red-600 max-w-xs text-center font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
