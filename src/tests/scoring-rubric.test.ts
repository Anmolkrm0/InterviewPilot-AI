import { describe, it, expect } from "vitest";
import { MockAIProvider } from "../lib/ai/mock-provider";

describe("Scoring Rubric & Evaluation", () => {
  const provider = new MockAIProvider();

  it("generates 5 calibrated mock questions", async () => {
    const questions = await provider.generateQuestions({
      role: "Senior QA Automation Engineer",
      focus: "mixed",
      resumeText: "Selenium and CI/CD experience",
      jobDescriptionText: "FinTech automated trading test automation",
    });

    expect(questions).toHaveLength(5);
    expect(questions[0].id).toBe("q1");
    expect(questions[1].topic).toBe("Test automation with dynamic UI");
  });

  it("evaluates answers within consistent 0-100 rubric scale", async () => {
    const questions = await provider.generateQuestions({
      role: "Senior QA Automation Engineer",
      focus: "mixed",
      resumeText: "Selenium",
      jobDescriptionText: "FinTech",
    });

    const evalResult = await provider.evaluateAnswer({
      role: "Senior QA Automation Engineer",
      focus: "mixed",
      question: questions[1],
      candidateAnswer:
        "Focused primarily on structuring tests with the Page Object Model, abstracting DOM element locators using stable data-testid tags, and running regression runs nightly.",
    });

    expect(evalResult.score).toBeGreaterThanOrEqual(0);
    expect(evalResult.score).toBeLessThanOrEqual(100);
    expect(evalResult.strengths.length).toBeGreaterThan(0);
    expect(evalResult.missingDetails.length).toBeGreaterThan(0);
    expect(evalResult.improvedAnswerExample?.sections.length).toBeGreaterThan(0);
  });

  it("evaluates focused retry with grounded concept improvements", async () => {
    const retryResult = await provider.evaluateRetry({
      role: "Senior QA Automation Engineer",
      originalAnswer: "Page Object Model with data-testid locators.",
      originalScore: 58,
      retryAnswer:
        "First, I inspect CI runner failure logs and video artifacts. I immediately isolate intermittent failures to a quarantine suite to avoid blocking the release, and enforce a 48-hour SLA for root-cause resolution.",
      targetedQuestion: "How do you isolate and resolve pipeline flakiness?",
      skillInFocus: "CI/CD Pipeline Triage",
    });

    expect(retryResult.reattemptScore).toBeGreaterThan(retryResult.originalScore);
    expect(retryResult.scoreDelta).toBeGreaterThan(0);
    expect(retryResult.conceptsAdded).toContain("Root-cause triage differentiating infra vs test code");
  });
});
