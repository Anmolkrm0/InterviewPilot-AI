import { describe, it, expect } from "vitest";
import { QuestionsArraySchema, AnswerEvaluationSchema } from "../lib/ai/types";

describe("AI Schema Validation", () => {
  it("validates 5 questions array schema", () => {
    const validQuestions = [
      { id: "q1", prompt: "How do you evaluate browser automation frameworks?", topic: "Frameworks", skillTags: ["Testing"] },
      { id: "q2", prompt: "How do you handle dynamic UI locators?", topic: "Locators", skillTags: ["POM"] },
      { id: "q3", prompt: "How do you triage CI/CD flaky tests in PRs?", topic: "CI/CD", skillTags: ["Pipelines"] },
      { id: "q4", prompt: "Tell me about a technical disagreement on test deadlines?", topic: "Behavioral", skillTags: ["Leadership"] },
      { id: "q5", prompt: "How do you structure cross-browser load testing?", topic: "Scale", skillTags: ["Performance"] },
    ];

    expect(() => QuestionsArraySchema.parse(validQuestions)).not.toThrow();

    // Less than 5 questions must fail
    expect(() => QuestionsArraySchema.parse(validQuestions.slice(0, 4))).toThrow();
  });

  it("validates answer evaluation schema", () => {
    const validEval = {
      score: 88,
      statusTag: "Solid Execution",
      strengths: ["Clear comparative matrix", "CDP protocols highlighted"],
      missingDetails: ["Legacy browser considerations"],
      improvementSuggestions: ["Add quantifiable speed benchmarks"],
      evidence: ["Quoted CDP protocol vs HTTP wire protocol"],
      technicalDepth: 92,
      clarity: 86,
    };

    expect(() => AnswerEvaluationSchema.parse(validEval)).not.toThrow();

    // Invalid score over 100 must fail
    expect(() => AnswerEvaluationSchema.parse({ ...validEval, score: 120 })).toThrow();
  });
});
