import { NextRequest, NextResponse } from "next/server";
import { getAIProvider, AIConfigurationError } from "@/lib/ai/provider";
import { InterviewFocus } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, focus, resumeText, jobDescriptionText, candidateName } = body;

    if (!role || !resumeText || !jobDescriptionText) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: role, resume text, and job description are required.",
        },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const questions = await provider.generateQuestions({
      role: role.trim(),
      focus: (focus as InterviewFocus) || "mixed",
      resumeText: resumeText.trim(),
      jobDescriptionText: jobDescriptionText.trim(),
      candidateName: candidateName?.trim(),
    });

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (err: unknown) {
    if (err instanceof AIConfigurationError) {
      return NextResponse.json(
        { success: false, error: err.message, isConfigError: true },
        { status: 503 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to generate interview questions.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
