import { NextRequest, NextResponse } from "next/server";
import { getAIProvider, AIConfigurationError } from "@/lib/ai/provider";
import { InterviewQuestion } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid questions array." },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const report = await provider.generateReport(
      role || "Software Engineer",
      questions as InterviewQuestion[]
    );

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: unknown) {
    if (err instanceof AIConfigurationError) {
      return NextResponse.json(
        { success: false, error: err.message, isConfigError: true },
        { status: 503 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to compile interview report.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
