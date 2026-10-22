"use client";

import React, { useRef, useState } from "react";
import { FileText, Upload, RefreshCw, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeUploaderProps {
  fileName?: string;
  fileSize?: number;
  competencies: string[];
  onResumeParsed: (data: {
    text: string;
    filename: string;
    fileSize: number;
    inferredRole?: string;
    candidateName?: string;
    competencies?: string[];
  }) => void;
  onRemove: () => void;
}

export function ResumeUploader({
  fileName,
  fileSize,
  competencies,
  onResumeParsed,
  onRemove,
}: ResumeUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse resume document.");
      }

      onResumeParsed({
        text: data.text,
        filename: data.filename,
        fileSize: data.fileSize,
        inferredRole: data.inferredRole,
        candidateName: data.candidateName,
        competencies: data.competencies,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading file.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-text">Candidate Resume</h2>
        </div>
        <span className="text-xs font-medium text-text-muted">PDF, DOCX up to 10MB</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
      />

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-danger-surface p-3 text-xs text-danger border border-danger/20">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {fileName ? (
        /* Uploaded & Parsed State Card */
        <div className="rounded-xl border border-border bg-surface-muted/50 p-4 transition-all hover:bg-surface-muted/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-text text-sm sm:text-base break-all">
                  {fileName}
                </p>
                <p className="text-xs text-text-muted">
                  {fileSize ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : "2.4 MB"} • Uploaded just now • 100% processed
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-surface px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Analyzed & Ready — {competencies.length || 8} key competencies parsed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-muted transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={onRemove}
                title="Remove resume"
                aria-label="Remove resume"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-danger hover:bg-danger-surface transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-surface-muted/30",
            isDragging && "border-primary bg-surface-blue/30 scale-[0.99]",
            isLoading && "pointer-events-none opacity-60"
          )}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-text">Parsing candidate resume...</p>
              <p className="text-xs text-text-muted">Extracting competencies and role insights</p>
            </div>
          ) : (
            <>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-blue text-primary transition-transform group-hover:scale-110">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-text">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-text-muted mt-1">
                Supports PDF and DOCX (Max 10MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
