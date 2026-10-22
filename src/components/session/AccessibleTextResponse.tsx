"use client";

import React, { useRef, useEffect } from "react";
import { Mic } from "lucide-react";
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
  placeholder = "Start typing...",
  onSwitchToVoice,
  autoFocus = true,
}: AccessibleTextResponseProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="flex flex-col w-full my-3">
      {/* Voice Mode Toggle Bar */}
      {onSwitchToVoice && (
        <div className="flex justify-end mb-2 px-1">
          <button
            type="button"
            onClick={onSwitchToVoice}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5F588A] hover:text-[#6C4AE8] transition-colors cursor-pointer"
          >
            <Mic className="h-3.5 w-3.5 text-[#6C4AE8]" />
            <span>Switch to voice</span>
          </button>
        </div>
      )}

      {/* Main Text Card matching Screenshot 2 */}
      <div className="relative rounded-2xl bg-white border border-[#E0DCFA]/80 shadow-xs p-4 sm:p-5 transition-all focus-within:ring-2 focus-within:ring-[#6C4AE8]/20 focus-within:border-[#6C4AE8]/50">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="w-full resize-none bg-transparent text-sm sm:text-base text-[#19104A] placeholder:text-[#8C86AF] focus:outline-none leading-relaxed font-normal selection:bg-[#E0DCFA]"
        />

        {/* Word / Char count info */}
        <div className="mt-2 pt-2 border-t border-[#F1EFFD] flex items-center justify-between text-2xs text-[#8C86AF] font-mono">
          <span>Non-verbal / Accessible Mode</span>
          <span>{value.trim() ? value.trim().split(/\s+/).length : 0} words • {value.length} chars</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Sign Language / Non-Verbal Accessibility Button (matching bottom-left icon in Screenshot 2)
 */
export function SignLanguageToggleButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={active ? "Switch to Voice" : "Switch to Text"}
      aria-label="Toggle text / non-verbal mode"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer shadow-xs active:scale-95",
        active
          ? "bg-[#6C4AE8] text-white"
          : "bg-[#E0DCFA] text-[#48388C] hover:bg-[#D5CEF8]"
      )}
    >
      {/* SVG Sign Language Hand icon matching Screenshot 2 */}
      <svg
        className="h-5 w-5 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M19.5 8.5c-.8 0-1.5.7-1.5 1.5v3.2l-1.3-.9c-.6-.4-1.5-.3-2 .3l-.7.8 4 4.5c.6.7 1.4 1.1 2.3 1.1h1.7c1.7 0 3-1.3 3-3V10c0-.8-.7-1.5-1.5-1.5h-4zM6.5 8c-.8 0-1.5.7-1.5 1.5v5.5c0 2.2 1.8 4 4 4h3c1.1 0 2.1-.5 2.8-1.3l2.2-2.7-1.2-1-2.3 1.8V5.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5V11H9V6.5C9 5.7 8.3 5 7.5 5S6 5.7 6 6.5V11H4.5V9.5C4.5 8.7 3.8 8 3 8s-1.5.7-1.5 1.5v6.5C1.5 19.5 4.5 22 8 22h4c2.2 0 4.2-1.1 5.3-2.9l2.7-3.6c.3-.4.3-1 0-1.4l-3-4V9.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5V11h-1.5V8c0-.8-.7-1.5-1.5-1.5S9.5 7.2 9.5 8V11H8V6.5C8 5.7 7.3 5 6.5 5z" />
      </svg>
    </button>
  );
}
