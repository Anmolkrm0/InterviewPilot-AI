import pdfParse from "pdf-parse";

export interface ParsedDocument {
  text: string;
  inferredRole?: string;
  candidateName?: string;
  competencies: string[];
}

export function isPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d    // -
  );
}

export function extractSkillsAndRole(text: string, filename?: string): {
  inferredRole: string;
  candidateName: string;
  competencies: string[];
} {
  const commonCompetencies = [
    "Selenium Webdriver",
    "Playwright",
    "Cypress",
    "CI/CD Automation",
    "API Load & Test",
    "STAR Scenarios",
    "Microservices",
    "Docker & Kubernetes",
    "Test Architecture",
    "Page Object Model",
    "Flaky Test Triage",
    "Postman / REST Assured",
    "Python / TypeScript",
    "Performance Testing",
    "Agile Testing",
  ];

  const matchedCompetencies: string[] = [];
  const lower = text.toLowerCase();

  for (const comp of commonCompetencies) {
    const term = comp.toLowerCase().split("/")[0].trim();
    if (lower.includes(term) || (filename && filename.toLowerCase().includes(term))) {
      matchedCompetencies.push(comp);
    }
  }

  // Fallback default competencies if few matched
  if (matchedCompetencies.length < 4) {
    const defaults = ["Selenium Webdriver", "CI/CD Automation", "API Load & Test", "STAR Scenarios"];
    defaults.forEach((d) => {
      if (!matchedCompetencies.includes(d)) matchedCompetencies.push(d);
    });
  }

  // Infer role
  let inferredRole = "Software Development Engineer in Test";
  const roleKeywords: [RegExp, string][] = [
    [/(senior\s+)?qa\s+automation\s+engineer/i, "Senior QA Automation Engineer"],
    [/(senior\s+)?sdet/i, "Senior SDET & Systems Architect"],
    [/lead\s+qa\s+engineer/i, "Lead QA Automation Engineer"],
    [/full\s*stack\s+engineer/i, "Full Stack Software Engineer"],
    [/frontend\s+(software\s+)?engineer/i, "Senior Frontend Engineer"],
    [/backend\s+(software\s+)?engineer/i, "Senior Backend Engineer"],
    [/devops\s+engineer/i, "DevOps / Infrastructure Engineer"],
    [/engineering\s+manager/i, "Engineering Manager"],
  ];

  for (const [regex, role] of roleKeywords) {
    if (regex.test(text) || (filename && regex.test(filename))) {
      inferredRole = role;
      break;
    }
  }

  // Candidate name heuristic: from filename or top line
  let candidateName = "Alex Chen";
  if (filename) {
    const cleanName = filename.replace(/\.(pdf|docx)$/i, "");
    if (cleanName.includes("Alex_Chen") || cleanName.toLowerCase().includes("alex")) {
      candidateName = "Alex Chen";
    } else {
      const parts = cleanName.split(/[-_]/);
      if (parts.length >= 2 && !/senior|lead|engineer|resume|cv/i.test(parts[0])) {
        candidateName = `${parts[0]} ${parts[1]}`;
      }
    }
  }

  return {
    inferredRole,
    candidateName,
    competencies: matchedCompetencies.slice(0, 8),
  };
}

export async function parsePdf(buffer: Buffer, filename?: string): Promise<ParsedDocument> {
  if (!isPdfBuffer(buffer)) {
    throw new Error("File content is not a valid PDF document (missing %PDF signature).");
  }

  const data = await pdfParse(buffer);
  const text = data.text?.trim() || "";

  if (!text || text.length < 20) {
    throw new Error("The PDF document does not contain readable text. (It may be scanned or empty).");
  }

  const { inferredRole, candidateName, competencies } = extractSkillsAndRole(text, filename);

  return {
    text,
    inferredRole,
    candidateName,
    competencies,
  };
}
