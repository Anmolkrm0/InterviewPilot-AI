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
  AlertCircle,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTechnicalSpeech } from "@/lib/technical-speech-formatter";

interface ResponseInputProps {
  initialAnswer?: string;
  isLastQuestion: boolean;
  questionTopic?: string;
  role?: string;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function ResponseInput({
  initialAnswer = "",
  isLastQuestion,
  questionTopic = "Technical Architecture",
  role = "Senior QA Automation Engineer",
  onSubmit,
  onSkip,
  isLoading,
}: ResponseInputProps) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Dictation Engine States
  const [engineMode, setEngineMode] = useState<"browser" | "whisper">("browser");
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // References
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setAnswer(initialAnswer);
    setInterimText("");
    setStatusNotice(null);
  }, [initialAnswer, questionTopic]);

  // Setup Web Speech API on mount
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
            setAnswer((prev) => {
              if (!prev || !prev.trim()) return formatted;
              const needsSpace = !prev.endsWith(" ") && !prev.endsWith("\n");
              return `${prev}${needsSpace ? " " : ""}${formatted}`;
            });
            setInterimText("");
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          if (event.error === "not-allowed") {
            setStatusNotice("Microphone access was denied. Please allow microphone permissions.");
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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // 1. Toggle Browser Real-Time Speech Recognition
  const toggleBrowserListening = () => {
    setStatusNotice(null);
    if (!recognitionRef.current) {
      setStatusNotice("Browser speech recognition is not supported in this browser. Try Chrome or Edge.");
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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else {
      try {
        setRecordingSeconds(0);
        recognitionRef.current.start();
        setIsListening(true);
        setStatusNotice("Listening to your voice... Speak naturally.");
        timerIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: unknown) {
        setIsListening(false);
        const msg = err instanceof Error ? err.message : "Error starting microphone.";
        setStatusNotice(msg);
      }
    }
  };

  // 2. Toggle Whisper Neural Audio Recording
  const startWhisperRecording = async () => {
    setStatusNotice(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleWhisperUpload(blob);
      };

      mediaRecorder.start(250);
      setIsListening(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Microphone error.";
      setStatusNotice(`Cannot record audio: ${msg}`);
      setIsListening(false);
    }
  };

  const stopWhisperRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const handleWhisperUpload = async (blob: Blob) => {
    setStatusNotice("Transcribing audio with Whisper AI...");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("role", role);
      formData.append("topic", questionTopic);

      const res = await fetch("/api/audio/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Whisper transcription failed.");
      }

      const text = data.text?.trim();
      if (text) {
        setAnswer((prev) => (prev ? `${prev} ${text}` : text));
        setStatusNotice(`Transcribed via ${data.provider}`);
        setTimeout(() => setStatusNotice(null), 3000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error transcribing.";
      setStatusNotice(msg);
    }
  };

  const handleMainMicClick = () => {
    if (engineMode === "browser") {
      toggleBrowserListening();
    } else {
      if (isListening) stopWhisperRecording();
      else startWhisperRecording();
    }
  };

  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const characters = answer.length;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-xs transition-colors">
      {/* Response Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-text">Your Response</h2>
        </div>

        {/* Voice Dictation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-surface-muted/50 p-0.5 text-2xs font-semibold text-text-muted">
            <button
              type="button"
              onClick={() => {
                if (isListening) toggleBrowserListening();
                setEngineMode("browser");
              }}
              className={cn(
                "rounded-md px-2 py-1 transition-all",
                engineMode === "browser"
                  ? "bg-surface text-primary shadow-xs font-bold"
                  : "hover:text-text"
              )}
            >
              Real-Time Dictation
            </button>
            <button
              type="button"
              onClick={() => {
                if (isListening) toggleBrowserListening();
                setEngineMode("whisper");
              }}
              className={cn(
                "rounded-md px-2 py-1 transition-all",
                engineMode === "whisper"
                  ? "bg-surface text-primary shadow-xs font-bold"
                  : "hover:text-text"
              )}
            >
              Whisper AI
            </button>
          </div>

          {/* Primary Mic Trigger Button */}
          <button
            type="button"
            onClick={handleMainMicClick}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all border shadow-2xs",
              isListening
                ? "bg-danger text-white border-danger animate-pulse shadow-danger/20"
                : "bg-surface-blue text-primary border-primary/25 hover:bg-primary hover:text-white"
            )}
          >
            {isListening ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                <span>
                  Listening... ({Math.floor(recordingSeconds / 60)}:
                  {recordingSeconds % 60 < 10 ? "0" : ""}
                  {recordingSeconds % 60})
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <Mic className="h-3.5 w-3.5" />
                <span>{engineMode === "browser" ? "Voice Dictation Ready" : "Record with Whisper"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Interim Speech Preview (shows actual speech being recognized live) */}
      {isListening && interimText && (
        <div className="mb-2.5 flex items-center gap-2 rounded-xl bg-surface-blue/60 p-2.5 text-xs text-primary border border-primary/20 animate-fade-in">
          <Volume2 className="h-4 w-4 shrink-0 animate-bounce" />
          <span className="font-semibold text-text-secondary">Hearing: </span>
          <span className="italic font-medium text-text truncate">"{interimText}"</span>
        </div>
      )}

      {/* Status Notice */}
      {statusNotice && (
        <div className="mb-2.5 flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-1.5 text-xs text-text-secondary border border-border">
          <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Answer Textarea */}
      <div className="relative">
        <textarea
          rows={7}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Speak using real-time voice dictation above or type your structured technical response here..."
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
