"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  InterviewFocus,
  InterviewQuestion,
  PracticeReport,
  FocusedPracticeData,
  FocusedEvaluationResult,
  AnswerEvaluation,
} from "@/lib/ai/types";

export interface SessionData {
  role: string;
  focus: InterviewFocus;
  candidateName: string;
  resumeText: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  competencies: string[];
  jobDescriptionText: string;
  jobDescriptionUrl?: string;
  detectedTechStack: string[];
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  elapsedSeconds: number;
  isSessionActive: boolean;
  isCompleted: boolean;
}

interface InterviewContextType {
  session: SessionData;
  report: PracticeReport | null;
  focusedData: FocusedPracticeData | null;
  focusedResult: FocusedEvaluationResult | null;
  setResumeData: (data: {
    text: string;
    filename: string;
    fileSize: number;
    inferredRole?: string;
    candidateName?: string;
    competencies?: string[];
  }) => void;
  removeResume: () => void;
  setJobDescription: (text: string, techStack?: string[], url?: string) => void;
  setRole: (role: string) => void;
  setFocus: (focus: InterviewFocus) => void;
  startSession: (questions: InterviewQuestion[]) => void;
  submitCurrentAnswer: (
    answer: string,
    timeSpentSeconds: number,
    wpm: number,
    evaluation: AnswerEvaluation
  ) => void;
  skipCurrentQuestion: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  setReport: (report: PracticeReport) => void;
  setFocusedData: (data: FocusedPracticeData) => void;
  setFocusedResult: (result: FocusedEvaluationResult) => void;
  resetSession: () => void;
}

const DEFAULT_SESSION: SessionData = {
  role: "Senior QA Automation Engineer",
  focus: "mixed",
  candidateName: "Alex Chen",
  resumeText: "",
  competencies: ["Selenium Webdriver", "CI/CD Automation", "API Load & Test", "STAR Scenarios"],
  jobDescriptionText: "",
  detectedTechStack: [],
  questions: [],
  currentQuestionIndex: 0,
  elapsedSeconds: 0,
  isSessionActive: false,
  isCompleted: false,
};

const InterviewContext = createContext<InterviewContextType | null>(null);

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewpilot_session");
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore storage parse errors
      }
    }
    return DEFAULT_SESSION;
  });

  const [report, setReportState] = useState<PracticeReport | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewpilot_report");
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [focusedData, setFocusedDataState] = useState<FocusedPracticeData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewpilot_focused_data");
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [focusedResult, setFocusedResultState] = useState<FocusedEvaluationResult | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewpilot_focused_result");
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return null;
  });

  // Persist session across refreshes in current browser tab
  useEffect(() => {
    try {
      sessionStorage.setItem("interviewpilot_session", JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [session]);

  // Timer effect when session is active
  useEffect(() => {
    if (!session.isSessionActive || session.isCompleted) return;

    const interval = setInterval(() => {
      setSession((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [session.isSessionActive, session.isCompleted]);

  const setResumeData = (data: {
    text: string;
    filename: string;
    fileSize: number;
    inferredRole?: string;
    candidateName?: string;
    competencies?: string[];
  }) => {
    setSession((prev) => ({
      ...prev,
      resumeText: data.text,
      resumeFileName: data.filename,
      resumeFileSize: data.fileSize,
      role: data.inferredRole || prev.role,
      candidateName: data.candidateName || prev.candidateName,
      competencies: data.competencies && data.competencies.length > 0 ? data.competencies : prev.competencies,
    }));
  };

  const removeResume = () => {
    setSession((prev) => ({
      ...prev,
      resumeText: "",
      resumeFileName: undefined,
      resumeFileSize: undefined,
    }));
  };

  const setJobDescription = (text: string, techStack?: string[], url?: string) => {
    setSession((prev) => ({
      ...prev,
      jobDescriptionText: text,
      jobDescriptionUrl: url,
      detectedTechStack: techStack || prev.detectedTechStack,
    }));
  };

  const setRole = (role: string) => {
    setSession((prev) => ({ ...prev, role }));
  };

  const setFocus = (focus: InterviewFocus) => {
    setSession((prev) => ({ ...prev, focus }));
  };

  const startSession = (questions: InterviewQuestion[]) => {
    setSession((prev) => ({
      ...prev,
      questions,
      currentQuestionIndex: 0,
      elapsedSeconds: 0,
      isSessionActive: true,
      isCompleted: false,
    }));
    setReportState(null);
  };

  const submitCurrentAnswer = (
    answer: string,
    timeSpentSeconds: number,
    wpm: number,
    evaluation: AnswerEvaluation
  ) => {
    setSession((prev) => {
      const updatedQuestions = [...prev.questions];
      const currentIndex = prev.currentQuestionIndex;

      if (updatedQuestions[currentIndex]) {
        updatedQuestions[currentIndex] = {
          ...updatedQuestions[currentIndex],
          answer,
          timeSpentSeconds,
          timeSpentFormatted: `${Math.floor(timeSpentSeconds / 60)}m ${timeSpentSeconds % 60}s`,
          pacingWpm: wpm,
          evaluation,
        };
      }

      const nextIndex = currentIndex + 1;
      const isNowCompleted = nextIndex >= updatedQuestions.length;

      return {
        ...prev,
        questions: updatedQuestions,
        currentQuestionIndex: isNowCompleted ? currentIndex : nextIndex,
        isCompleted: isNowCompleted,
      };
    });
  };

  const skipCurrentQuestion = () => {
    setSession((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isNowCompleted = nextIndex >= prev.questions.length;
      return {
        ...prev,
        currentQuestionIndex: isNowCompleted ? prev.currentQuestionIndex : nextIndex,
        isCompleted: isNowCompleted,
      };
    });
  };

  const setCurrentQuestionIndex = (index: number) => {
    setSession((prev) => ({
      ...prev,
      currentQuestionIndex: index,
    }));
  };

  const setReport = (newReport: PracticeReport) => {
    setReportState(newReport);
    try {
      sessionStorage.setItem("interviewpilot_report", JSON.stringify(newReport));
    } catch {
      // ignore
    }
  };

  const setFocusedData = (data: FocusedPracticeData) => {
    setFocusedDataState(data);
    try {
      sessionStorage.setItem("interviewpilot_focused_data", JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  const setFocusedResult = (result: FocusedEvaluationResult) => {
    setFocusedResultState(result);
    try {
      sessionStorage.setItem("interviewpilot_focused_result", JSON.stringify(result));
    } catch {
      // ignore
    }
  };

  const resetSession = () => {
    setSession(DEFAULT_SESSION);
    setReportState(null);
    setFocusedDataState(null);
    setFocusedResultState(null);
    try {
      sessionStorage.removeItem("interviewpilot_session");
      sessionStorage.removeItem("interviewpilot_report");
      sessionStorage.removeItem("interviewpilot_focused_data");
      sessionStorage.removeItem("interviewpilot_focused_result");
    } catch {
      // ignore
    }
  };

  return (
    <InterviewContext.Provider
      value={{
        session,
        report,
        focusedData,
        focusedResult,
        setResumeData,
        removeResume,
        setJobDescription,
        setRole,
        setFocus,
        startSession,
        submitCurrentAnswer,
        skipCurrentQuestion,
        setCurrentQuestionIndex,
        setReport,
        setFocusedData,
        setFocusedResult,
        resetSession,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
}
