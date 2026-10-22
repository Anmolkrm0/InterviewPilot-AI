import { z } from "zod";

export type InterviewFocus = "technical" | "behavioral" | "mixed";

export interface AnswerEvaluation {
  score: number; // 0 - 100
  statusTag?: string; // "Needs Attention", "Solid Execution", "Exemplary"
  strengths: string[];
  missingDetails: string[];
  improvementSuggestions: string[];
  evidence: string[];
  improvedAnswerExample?: {
    title: string;
    sections: { heading: string; content: string }[];
    starOutlineText: string;
  };
  keyTakeaway?: string;
  technicalDepth?: number;
  clarity?: number;
}

export interface InterviewQuestion {
  id: string;
  prompt: string;
  topic: string;
  skillTags: string[];
  personaTitle?: string;
  targetFocalPoints?: string;
  answer?: string;
  audioUrl?: string;
  timeSpentSeconds?: number;
  timeSpentFormatted?: string;
  pacingWpm?: number;
  followUps?: string[];
  evaluation?: AnswerEvaluation;
}

export interface PracticeReport {
  overallScore: number;
  peerMedianDelta: number;
  competencyConfidence: number;
  strongestArea: {
    title: string;
    score: number;
    description: string;
  };
  biggestOpportunity: {
    title: string;
    score: number;
    description: string;
    questionId: string;
  };
  recommendedAction: {
    title: string;
    description: string;
    targetQuestionId: string;
  };
  coachObservation: string;
  evaluatedAnswers: InterviewQuestion[];
}

export interface FocusedPracticeData {
  drillStep: string;
  skillInFocus: string;
  category: string;
  whyPreviousNeededWork: string;
  keyPoints: { id: number; title: string; detail: string }[];
  newTargetedQuestion: string;
  idealWordRange: { min: number; max: number };
  originalScore: number;
  keyConceptTriggers: { id: string; label: string; regex: string }[];
}

export interface FocusedEvaluationResult {
  originalScore: number;
  reattemptScore: number;
  scoreDelta: number;
  whatChanged: string;
  conceptsAdded: string[];
  drillReliability: string;
}

export interface GenerateQuestionsInput {
  role: string;
  focus: InterviewFocus;
  resumeText: string;
  jobDescriptionText: string;
  candidateName?: string;
}

export interface EvaluateAnswerInput {
  role: string;
  focus: InterviewFocus;
  question: InterviewQuestion;
  candidateAnswer: string;
  jobDescriptionText?: string;
}

export interface FocusedPracticeInput {
  role: string;
  weakQuestion: InterviewQuestion;
  evaluation: AnswerEvaluation;
}

export interface EvaluateRetryInput {
  role: string;
  originalAnswer: string;
  originalScore: number;
  retryAnswer: string;
  targetedQuestion: string;
  skillInFocus: string;
}

export interface InterviewAIProvider {
  generateQuestions(input: GenerateQuestionsInput): Promise<InterviewQuestion[]>;
  generateFollowUp(question: InterviewQuestion, answer: string): Promise<string | null>;
  evaluateAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluation>;
  generateReport(role: string, questions: InterviewQuestion[]): Promise<PracticeReport>;
  generateFocusedQuestion(input: FocusedPracticeInput): Promise<FocusedPracticeData>;
  evaluateRetry(input: EvaluateRetryInput): Promise<FocusedEvaluationResult>;
}

// Zod schemas for structured validation
export const QuestionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(10),
  topic: z.string(),
  skillTags: z.array(z.string()).default([]),
  personaTitle: z.string().optional(),
  targetFocalPoints: z.string().optional(),
});

export const QuestionsArraySchema = z.array(QuestionSchema).length(5);

export const AnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  statusTag: z.string().optional(),
  strengths: z.array(z.string()).min(1),
  missingDetails: z.array(z.string()).min(1),
  improvementSuggestions: z.array(z.string()).min(1),
  evidence: z.array(z.string()).default([]),
  improvedAnswerExample: z
    .object({
      title: z.string(),
      sections: z.array(
        z.object({
          heading: z.string(),
          content: z.string(),
        })
      ),
      starOutlineText: z.string(),
    })
    .optional(),
  keyTakeaway: z.string().optional(),
  technicalDepth: z.number().min(0).max(100).optional(),
  clarity: z.number().min(0).max(100).optional(),
});
