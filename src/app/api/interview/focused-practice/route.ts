import { NextRequest, NextResponse } from "next/server";
import { getAIProvider, AIConfigurationError } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const provider = getAIProvider();

    if (action === "generate") {
      const { role, weakQuestion, evaluation } = body;
      if (!weakQuestion || !evaluation) {
        return NextResponse.json(
          { success: false, error: "Missing weakQuestion or evaluation payload." },
          { status: 400 }
        );
      }

      const focusedData = await provider.generateFocusedQuestion({
        role: role || "Software Engineer",
        weakQuestion,
        evaluation,
      });

      return NextResponse.json({
        success: true,
        focusedData,
      });
    }

    if (action === "evaluate") {
      const {
        role,
        originalAnswer,
        originalScore,
        retryAnswer,
        targetedQuestion,
        skillInFocus,
      } = body;

      if (!retryAnswer) {
        return NextResponse.json(
          { success: false, error: "Please enter your improved response." },
          { status: 400 }
        );
      }

      const result = await provider.evaluateRetry({
        role: role || "Software Engineer",
        originalAnswer: originalAnswer || "",
        originalScore: originalScore || 58,
        retryAnswer: retryAnswer.trim(),
        targetedQuestion: targetedQuestion || "",
        skillInFocus: skillInFocus || "System Health & Reliability",
      });

      return NextResponse.json({
        success: true,
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Expected 'generate' or 'evaluate'." },
      { status: 400 }
    );
  } catch (err: unknown) {
    if (err instanceof AIConfigurationError) {
      return NextResponse.json(
        { success: false, error: err.message, isConfigError: true },
        { status: 503 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to process focused practice.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
