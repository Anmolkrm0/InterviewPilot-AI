import { NextRequest, NextResponse } from "next/server";
import { getAIProvider, AIConfigurationError } from "@/lib/ai/provider";
import { InterviewFocus, InterviewQuestion } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, focus, question, candidateAnswer, jobDescriptionText } = body;

    if (!question || candidateAnswer === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: question and answer are required." },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const evaluation = await provider.evaluateAnswer({
      role: role || "Software Engineer",
      focus: (focus as InterviewFocus) || "mixed",
      question: question as InterviewQuestion,
      candidateAnswer: candidateAnswer.trim(),
      jobDescriptionText,
    });

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: unknown) {
    if (err instanceof AIConfigurationError) {
      return NextResponse.json(
        { success: false, error: err.message, isConfigError: true },
        { status: 503 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to evaluate answer.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
