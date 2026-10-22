"use client";

import React from "react";
import {
  Sparkles,
  Pencil,
  Code2,
  HelpCircle,
  Layers,
  ArrowRight,
  Clock,
  Shield,
  Mic,
  Loader2,
} from "lucide-react";
import { InterviewFocus } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface RoleAndFocusSelectorProps {
  role: string;
  focus: InterviewFocus;
  onRoleChange: (role: string) => void;
  onFocusChange: (focus: InterviewFocus) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isValid: boolean;
}

export function RoleAndFocusSelector({
  role,
  focus,
  onRoleChange,
  onFocusChange,
  onSubmit,
  isLoading,
  isValid,
}: RoleAndFocusSelectorProps) {
  const focusOptions: { id: InterviewFocus; label: string; icon: React.ReactNode; recommended?: boolean }[] = [
    {
      id: "technical",
      label: "Technical",
      icon: <Code2 className="h-4 w-4" />,
    },
    {
      id: "behavioral",
      label: "Behavioral",
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      id: "mixed",
      label: "Mixed (Recommended)",
      icon: <Layers className="h-4 w-4" />,
      recommended: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Target Role Card */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text">Target Role</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-blue px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" />
              Extracted from resume
            </span>
          </div>
          <span className="text-xs text-text-muted">Editable</span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            placeholder="e.g. Senior QA Automation Engineer"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pr-10 text-sm font-medium text-text focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary/40 transition-colors"
          />
          <Pencil className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Interview Focus Card */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-text">Interview Focus</span>
          <span className="text-xs text-text-muted">Tailors scenario generation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {focusOptions.map((opt) => {
            const isSelected = focus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFocusChange(opt.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-surface-blue text-primary shadow-xs ring-1 ring-primary/30"
                    : "border-border bg-surface text-text-secondary hover:bg-surface-muted hover:text-text"
                )}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary CTA and Meta */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          disabled={!isValid || isLoading}
          onClick={onSubmit}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-md hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Synthesizing Tailored Interview Questions...</span>
            </>
          ) : (
            <>
              <span>Start Mock Interview (5 Questions)</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Metadata info row */}
        <div className="flex items-center justify-center gap-4 text-xs text-text-muted flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>10–15 mins</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-success" />
            <span>No account required</span>
          </div>
          <div className="flex items-center gap-1">
            <Mic className="h-3.5 w-3.5 text-primary" />
            <span>Audio-enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
