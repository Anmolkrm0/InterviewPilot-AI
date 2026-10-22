import { describe, it, expect } from "vitest";
import { isPdfBuffer, extractSkillsAndRole, parsePdf } from "../lib/parsers/pdf-parser";
import { isDocxBuffer } from "../lib/parsers/docx-parser";

describe("Document Parsers", () => {
  it("detects valid PDF magic bytes (%PDF-)", () => {
    const validPdfBuffer = Buffer.from("%PDF-1.7\nSample PDF");
    expect(isPdfBuffer(validPdfBuffer)).toBe(true);

    const invalidBuffer = Buffer.from("Not a real PDF file");
    expect(isPdfBuffer(invalidBuffer)).toBe(false);
  });

  it("detects valid DOCX magic bytes (PK\\x03\\x04)", () => {
    const validDocxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    expect(isDocxBuffer(validDocxBuffer)).toBe(true);

    const invalidBuffer = Buffer.from("Plain text file");
    expect(isDocxBuffer(invalidBuffer)).toBe(false);
  });

  it("extracts competencies and roles from resume text", () => {
    const resumeText = `
      Alex Chen
      Senior QA Automation Engineer with extensive expertise in Selenium Webdriver, Playwright,
      CI/CD Automation, and API Load & Test for distributed microservices.
    `;

    const { inferredRole, candidateName, competencies } = extractSkillsAndRole(
      resumeText,
      "Alex_Chen_Senior_QA_Automation_Engineer.pdf"
    );

    expect(candidateName).toBe("Alex Chen");
    expect(inferredRole).toBe("Senior QA Automation Engineer");
    expect(competencies).toContain("Selenium Webdriver");
    expect(competencies).toContain("CI/CD Automation");
  });

  it("throws error for corrupt PDF file missing %PDF header", async () => {
    const corruptBuffer = Buffer.from("Corrupt file contents");
    await expect(parsePdf(corruptBuffer)).rejects.toThrow("File content is not a valid PDF document");
  });
});
