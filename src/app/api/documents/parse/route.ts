import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/parsers/pdf-parser";
import { parseDocx } from "@/lib/parsers/docx-parser";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in request." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        },
        { status: 413 }
      );
    }

    const filename = file.name.toLowerCase();
    const isPdf = filename.endsWith(".pdf");
    const isDocx = filename.endsWith(".docx");

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Only PDF and DOCX files are permitted.",
        },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedResult;
    if (isPdf) {
      parsedResult = await parsePdf(buffer, file.name);
    } else {
      parsedResult = await parseDocx(buffer, file.name);
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      fileSize: file.size,
      text: parsedResult.text,
      inferredRole: parsedResult.inferredRole,
      candidateName: parsedResult.candidateName,
      competencies: parsedResult.competencies,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse document.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 422 }
    );
  }
}
