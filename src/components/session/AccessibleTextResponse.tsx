"use client";

import React, { useRef, useEffect } from "react";
import { Hand, Mic, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibleTextResponseProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onSwitchToVoice?: () => void;
  autoFocus?: boolean;
}

export function AccessibleTextResponse({
  value,
  onChange,
  placeholder = "Start typing your response here...",
  onSwitchToVoice,
  autoFocus = true,
}: AccessibleTextResponseProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="flex flex-col w-full my-4">
      {/* Non-verbal / Accessibility header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-blue text-primary border border-primary/20">
            <Hand className="h-3.5 w-3.5" />
          </div>
          <span>Non-verbal / Text Input Mode</span>
        </div>

        {onSwitchToVoice && (
          <button
            type="button"
            onClick={onSwitchToVoice}
            className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            <Mic className="h-3.5 w-3.5 text-primary" />
            <span>Switch to voice</span>
          </button>
        )}
      </div>

      {/* Main Text Input Card */}
      <div className="relative rounded-2xl bg-white border border-border/80 shadow-xs focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10 transition-all p-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="w-full resize-none bg-transparent text-sm sm:text-base text-text placeholder:text-text-muted focus:outline-none leading-relaxed"
        />

        {/* Footer info inside card */}
        <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary/70" />
            <span>Real-time capture</span>
          </span>
          <div className="flex items-center gap-3 tabular-nums font-mono">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
