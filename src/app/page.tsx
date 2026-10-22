"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Key } from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { DeviceContainer } from "@/components/layout/DeviceContainer";
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

  // Default initial values calibrated to case study
  const defaultResumeFileName = session.resumeFileName || "Alex_Chen_Lead_Data_Analyst.pdf";
  const defaultResumeText =
    session.resumeText ||
    "Alex Chen - Lead Data Analyst. 6+ years experience leading data analytics projects from problem framing to ETL pipelines, anomaly detection, statistical modeling, and executive stakeholder insights.";

  const defaultJdText =
    session.jobDescriptionText ||
    "Lead Data Analyst: Seeking an analytical leader to scope business problems, build validation checks, ensure data reproducibility, and communicate actionable insights.";

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
          role: session.role || "Lead Data Analyst",
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
    <DeviceContainer defaultMode="web" allowToggle={true}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 transition-colors">
        {/* Top Banner Pill */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-[#E0DCFA] bg-white px-4 py-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-[#19104A] font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Practice like it's real. Calm, supportive, empathetic interview experience.</span>
          </div>
          <div className="flex items-center gap-3 text-[#5F588A]">
            <span className="flex items-center gap-1.5 font-bold text-[#6C4AE8]">
              <span className="h-2 w-2 rounded-full bg-[#6C4AE8] animate-pulse" />
              Designing for Empathy
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Free Practice Baseline</span>
          </div>
        </div>

        {/* Main Title Heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#19104A]">
            Let's prepare you for your next interview.
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[#5F588A]">
            Share your resume and the target role. We'll simulate a calm, realistic mock interview
            tailored to your experience.
          </p>
        </div>

        {/* Error / Config Alert */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 shadow-xs">
            <div className="flex items-start gap-2.5">
              {isConfigError ? (
                <Key className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold">{isConfigError ? "AI Configuration Required" : "Generation Error"}</p>
                <p className="mt-1 leading-relaxed">{errorMessage}</p>
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
              role={session.role || "Lead Data Analyst"}
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
    </DeviceContainer>
  );
}
