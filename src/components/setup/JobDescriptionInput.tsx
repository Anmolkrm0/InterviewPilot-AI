"use client";

import React, { useState, useRef } from "react";
import {
  Briefcase,
  AlignLeft,
  Upload,
  Link2,
  Sparkles,
  RotateCcw,
  ClipboardPaste,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobDescriptionInputProps {
  value: string;
  detectedTechStack: string[];
  onChange: (text: string, techStack?: string[], url?: string) => void;
}

export function JobDescriptionInput({
  value,
  detectedTechStack,
  onChange,
}: JobDescriptionInputProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "url">("paste");
  const [urlInput, setUrlInput] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSuccess, setUrlSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const sampleJd =
    "Senior QA Automation Engineer at FinTech Global: Seeking an experienced engineer with Selenium, Playwright, CI/CD pipelines, and microservices API testing. Responsibilities include designing automated regression suites for high-frequency trading web portals.";

  const handleInsertSample = () => {
    onChange(sampleJd, ["Playwright", "Selenium", "CI/CD", "Microservices"]);
  };

  const handleClear = () => {
    onChange("", []);
    setUrlSuccess(null);
    setUrlError(null);
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) {
      setUrlError("Please enter a valid URL.");
      return;
    }

    setUrlError(null);
    setUrlSuccess(null);
    setIsUrlLoading(true);

    try {
      const res = await fetch("/api/job-description/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to extract job description from URL.");
      }

      onChange(data.text, data.detectedTechStack, urlInput);
      setUrlSuccess(`Successfully extracted ${data.characterCount} characters from job posting.`);
      setActiveTab("paste"); // Switch back to view/edit parsed text
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching URL.";
      setUrlError(msg);
    } finally {
      setIsUrlLoading(false);
    }
  };

  const handleUploadJdFile = async (file: File) => {
    setFileError(null);
    setIsFileLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse document.");
      }

      onChange(data.text, data.competencies);
      setActiveTab("paste");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse file.";
      setFileError(msg);
    } finally {
      setIsFileLoading(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
      {/* Header and Input Mode Tabs */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-text">
            Job Description <span className="text-primary">*</span>
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center rounded-lg border border-border bg-surface-muted/50 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 transition-all",
              activeTab === "paste"
                ? "bg-surface text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text"
            )}
          >
            <AlignLeft className="h-3.5 w-3.5" />
            <span>Paste Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 transition-all",
              activeTab === "upload"
                ? "bg-surface text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text"
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload PDF/DOCX</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 transition-all",
              activeTab === "url"
                ? "bg-surface text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text"
            )}
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Fetch from URL</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Paste Text */}
      {activeTab === "paste" && (
        <div>
          <div className="relative">
            <textarea
              rows={4}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste the target job description or requirements here..."
              className="w-full rounded-xl border border-border bg-surface p-3.5 text-sm text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary/40 transition-colors leading-relaxed"
            />
          </div>

          {/* Bottom Bar: Detected tech stack and actions */}
          <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-success font-medium flex-wrap">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>
                Detected tech stack:{" "}
                {detectedTechStack.length > 0
                  ? detectedTechStack.join(", ")
                  : "Playwright, Selenium, CI/CD, Microservices"}
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto text-text-muted">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 hover:text-danger transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleInsertSample}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors font-medium text-text-secondary"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                <span>Insert Sample</span>
              </button>
              <span className="text-text-muted/80">{value.length} characters</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Upload PDF/DOCX */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadJdFile(file);
            }}
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          {fileError && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-surface p-3 text-xs text-danger border border-danger/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{fileError}</span>
            </div>
          )}

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-surface-muted/30"
          >
            {isFileLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm font-semibold text-text">Parsing job description document...</p>
              </div>
            ) : (
              <>
                <Upload className="h-7 w-7 text-primary mb-1" />
                <p className="text-sm font-semibold text-text">Upload Job Description File</p>
                <p className="text-xs text-text-muted mt-0.5">Supports PDF and DOCX (Max 10MB)</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Fetch from URL */}
      {activeTab === "url" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://boards.greenhouse.io/company/jobs/12345"
              className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary/40"
            />
            <button
              type="button"
              disabled={isUrlLoading}
              onClick={handleFetchUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition-all shrink-0"
            >
              {isUrlLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  <span>Fetch from link</span>
                </>
              )}
            </button>
          </div>

          {urlError && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-surface p-3 text-xs text-danger border border-danger/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Extraction Failed</p>
                <p className="mt-0.5">{urlError}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("paste")}
                  className="mt-1.5 underline font-medium hover:text-danger/80"
                >
                  Switch to Paste Text fallback
                </button>
              </div>
            </div>
          )}

          {urlSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success-surface p-3 text-xs text-success border border-success/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{urlSuccess}</span>
            </div>
          )}

          <p className="text-xs text-text-muted">
            Directly extracts publicly accessible job posting pages. Protected or JavaScript-heavy boards (e.g. LinkedIn, Workday) may require pasting text.
          </p>
        </div>
      )}
    </div>
  );
}
