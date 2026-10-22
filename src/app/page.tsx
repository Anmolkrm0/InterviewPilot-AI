"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Key } from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { ResumeUploader } from "@/components/setup/ResumeUploader";
import { JobDescriptionInput } from "@/components/setup/JobDescriptionInput";
import { RoleAndFocusSelector } from "@/components/setup/RoleAndFocusSelector";
import { SidebarCards } from "@/components/setup/SidebarCards";

export default function SetupPage() {
  const router = useRouter();
  const { session, setResumeData, removeResume, setJobDescription, setRole, setFocus, startSession } =
    useInterview();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);

  // Default initial values if not set
  const defaultResumeFileName = session.resumeFileName || "Alex_Chen_Senior_QA_Automation_Engineer.pdf";
  const defaultResumeText =
    session.resumeText ||
    "Alex Chen - Senior QA Automation Engineer. 8+ years experience in automated testing with Selenium, Playwright, CI/CD pipelines, Docker, Kubernetes, API testing, and performance testing for FinTech trading applications.";

  const defaultJdText =
    session.jobDescriptionText ||
    "Senior QA Automation Engineer at FinTech Global: Seeking an experienced engineer with Selenium, Playwright, CI/CD pipelines, and microservices API testing. Responsibilities include designing automated regression suites for high-frequency trading web portals.";

  const handleStartMockInterview = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsConfigError(false);

    const resumeToUse = session.resumeText || defaultResumeText;
    const jdToUse = session.jobDescriptionText || defaultJdText;

    try {
      const res = await fetch("/api/interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: session.role || "Senior QA Automation Engineer",
          focus: session.focus || "mixed",
          candidateName: session.candidateName || "Alex Chen",
          resumeText: resumeToUse,
          jobDescriptionText: jdToUse,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isConfigError) {
          setIsConfigError(true);
        }
        throw new Error(data.error || "Failed to generate mock interview questions.");
      }

      startSession(data.questions);
      router.push("/session");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 transition-colors">
      {/* Top Banner Pill */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-2 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-text font-medium">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <span>Practice like it's real. Know what to improve.</span>
        </div>
        <div className="flex items-center gap-3 text-text-muted">
          <span className="flex items-center gap-1.5 font-medium text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            Zero Setup Latency
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Free Baseline Session</span>
        </div>
      </div>

      {/* Main Title Heading */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
          Let's prepare you for your next interview.
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-text-secondary">
          Share your resume and the job description. We'll create a realistic mock interview tailored to
          your experience.
        </p>
      </div>

      {/* Error / Config Alert */}
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger-surface p-4 text-xs sm:text-sm text-danger shadow-xs">
          <div className="flex items-start gap-2.5">
            {isConfigError ? (
              <Key className="h-5 w-5 shrink-0 text-danger mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-danger mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold">{isConfigError ? "AI Configuration Required" : "Generation Error"}</p>
              <p className="mt-1 leading-relaxed">{errorMessage}</p>
              {isConfigError && (
                <div className="mt-2.5 rounded-lg bg-surface/80 p-2.5 text-xs text-text border border-border font-mono">
                  Tip: Set <code className="text-primary font-bold">AI_PROVIDER=mock</code> in your .env or Render dashboard for instant evaluation, or configure <code className="text-primary font-bold">AI_API_KEY</code> with your Gemini / hosted model key.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Main Form) */}
        <div className="lg:col-span-8 space-y-5">
          <ResumeUploader
            fileName={session.resumeFileName || defaultResumeFileName}
            fileSize={session.resumeFileSize || 2.4 * 1024 * 1024}
            competencies={session.competencies}
            onResumeParsed={(data) => setResumeData(data)}
            onRemove={removeResume}
          />

          <JobDescriptionInput
            value={session.jobDescriptionText || defaultJdText}
            detectedTechStack={session.detectedTechStack}
            onChange={(text, stack, url) => setJobDescription(text, stack, url)}
          />

          <RoleAndFocusSelector
            role={session.role}
            focus={session.focus}
            onRoleChange={setRole}
            onFocusChange={setFocus}
            onSubmit={handleStartMockInterview}
            isLoading={isLoading}
            isValid={true}
          />
        </div>

        {/* Right Column (Sidebars) */}
        <div className="lg:col-span-4">
          <SidebarCards
            candidateName={session.candidateName || "Alex Chen"}
            competencies={session.competencies}
          />
        </div>
      </div>
    </div>
  );
}
