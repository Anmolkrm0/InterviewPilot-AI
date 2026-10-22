import mammoth from "mammoth";
import { ParsedDocument, extractSkillsAndRole } from "./pdf-parser";

export function isDocxBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x50 && // P
    buffer[1] === 0x4b && // K
    buffer[2] === 0x03 && // 0x03
    buffer[3] === 0x04    // 0x04
  );
}

export async function parseDocx(buffer: Buffer, filename?: string): Promise<ParsedDocument> {
  if (!isDocxBuffer(buffer)) {
    throw new Error("File content is not a valid DOCX document (missing PK zip signature).");
  }

  const result = await mammoth.extractRawText({ buffer });
  const text = result.value?.trim() || "";

  if (!text || text.length < 20) {
    throw new Error("The DOCX document does not contain readable text.");
  }

  const { inferredRole, candidateName, competencies } = extractSkillsAndRole(text, filename);

  return {
    text,
    inferredRole,
    candidateName,
    competencies,
  };
}
