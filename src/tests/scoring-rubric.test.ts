import { describe, it, expect } from "vitest";
import { MockAIProvider } from "../lib/ai/mock-provider";

describe("Scoring Rubric & Evaluation", () => {
  const provider = new MockAIProvider();

  it("generates 5 calibrated mock questions matching empathy case study", async () => {
    const questions = await provider.generateQuestions({
      role: "Lead Data Analyst",
      focus: "mixed",
      resumeText: "ETL pipelines, statistical modeling, and data architecture",
      jobDescriptionText: "Lead Data Analyst delivering actionable insights",
    });

    expect(questions).toHaveLength(5);
    expect(questions[0].id).toBe("q1");
    expect(questions[0].topic).toBe("Data Project Walkthrough");
    expect(questions[1].id).toBe("q2");
    expect(questions[1].topic).toBe("Project Challenges & Overcoming Roadblocks");
    expect(questions[1].isFollowUp).toBe(true);
  });

  it("evaluates answers within consistent 0-100 rubric scale with empathy metrics", async () => {
    const questions = await provider.generateQuestions({
      role: "Lead Data Analyst",
      focus: "mixed",
      resumeText: "Data modeling",
      jobDescriptionText: "Analytics",
    });

    const evalResult = await provider.evaluateAnswer({
      role: "Lead Data Analyst",
      focus: "mixed",
      question: questions[0],
      candidateAnswer:
        "Walked through validation checks, ETL transformations, and dashboard delivery.",
    });

    expect(evalResult.score).toBeGreaterThanOrEqual(0);
    expect(evalResult.score).toBeLessThanOrEqual(100);
    expect(evalResult.accuracy).toBeGreaterThanOrEqual(0);
    expect(evalResult.depth).toBeGreaterThanOrEqual(0);
    expect(evalResult.relevance).toBeGreaterThanOrEqual(0);
    expect(evalResult.strengths.length).toBeGreaterThan(0);
    expect(evalResult.missingDetails.length).toBeGreaterThan(0);
  });

  it("generates empathy report with 72.5 score, 93% focus level, and 8.3s response time", async () => {
    const questions = await provider.generateQuestions({
      role: "Lead Data Analyst",
      focus: "mixed",
      resumeText: "Data modeling",
      jobDescriptionText: "Analytics",
    });

    const report = await provider.generateReport("Lead Data Analyst", questions);

    expect(report.finalScore).toBe(72.5);
    expect(report.focusLevel).toBe(93);
    expect(report.averageResponseTimeSec).toBe(8.3);
    expect(report.evaluatedAnswers).toHaveLength(5);
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
