"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Edit3,
  Mic,
  Square,
  CheckCircle2,
  ArrowRight,
  SkipForward,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Radio,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptionNotice, setTranscriptionNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setAnswer(initialAnswer);
  }, [initialAnswer]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setTranscriptionNotice(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone access is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 500) {
          await transcribeAudioBlob(audioBlob);
        }
      };

      mediaRecorder.start(250); // Collect data chunks every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to access microphone.";
      setTranscriptionNotice(`Microphone error: ${msg}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  const transcribeAudioBlob = async (blob: Blob) => {
    setIsTranscribing(true);

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
        throw new Error(data.error || "Transcription failed.");
      }

      const transcribedText = data.text?.trim();
      if (transcribedText) {
        setAnswer((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
        setTranscriptionNotice(`Transcribed with high accuracy (${data.provider || "Neural STT"})`);
        setTimeout(() => setTranscriptionNotice(null), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transcription error.";
      setTranscriptionNotice(`Notice: ${msg}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const characters = answer.length;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-xs transition-colors">
      {/* Response Header with High-Accuracy Neural Recording */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-text">Your Response</h2>
        </div>

        {/* Neural STT Button */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-full bg-danger px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-danger/90 animate-pulse transition-all"
            >
              <Square className="h-3.5 w-3.5 fill-white" />
              <span>
                Stop Recording ({Math.floor(recordingSeconds / 60)}:
                {recordingSeconds % 60 < 10 ? "0" : ""}
                {recordingSeconds % 60})
              </span>
            </button>
          ) : isTranscribing ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-blue px-3.5 py-1.5 text-xs font-semibold text-primary border border-primary/20">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Transcribing with Neural AI...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-blue px-3.5 py-1 text-xs font-semibold text-primary border border-primary/25 hover:bg-primary hover:text-white transition-all shadow-2xs group"
            >
              <Radio className="h-3.5 w-3.5 text-success group-hover:text-white animate-pulse" />
              <Mic className="h-3.5 w-3.5" />
              <span>High-Accuracy Voice Dictation</span>
            </button>
          )}
        </div>
      </div>

      {transcriptionNotice && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-surface-muted/80 px-3 py-1.5 text-xs text-text-secondary border border-border">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{transcriptionNotice}</span>
        </div>
      )}

      {/* Answer Textarea */}
      <div className="relative">
        <textarea
          rows={7}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Speak using high-accuracy neural voice dictation above or type your structured response..."
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
