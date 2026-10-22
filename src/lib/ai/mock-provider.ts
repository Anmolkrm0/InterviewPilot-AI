import {
  InterviewAIProvider,
  GenerateQuestionsInput,
  InterviewQuestion,
  EvaluateAnswerInput,
  AnswerEvaluation,
  PracticeReport,
  FocusedPracticeInput,
  FocusedPracticeData,
  EvaluateRetryInput,
  FocusedEvaluationResult,
} from "./types";

export class MockAIProvider implements InterviewAIProvider {
  async generateQuestions(input: GenerateQuestionsInput): Promise<InterviewQuestion[]> {
    return [
      {
        id: "q1",
        prompt:
          "Can you walk me through a data project you've worked on, from problem definition to actionable insights?",
        topic: "Data Project Walkthrough",
        skillTags: ["Data Architecture", "Actionable Insights"],
        isFollowUp: false,
        personaTitle: "Lead Interviewer",
        targetFocalPoints:
          "Demonstrate clear lifecycle: business problem framing, ETL/cleansing, statistical modeling, and stakeholder insights.",
      },
      {
        id: "q2",
        prompt:
          "What challenges did you face during that project, and how did you overcome them?",
        topic: "Project Challenges & Overcoming Roadblocks",
        skillTags: ["Problem Solving", "Resilience"],
        isFollowUp: true,
        personaTitle: "Lead Interviewer",
        targetFocalPoints:
          "Focus on unexpected technical roadblocks (data quality, pipeline scaling) and collaborative mitigation.",
      },
      {
        id: "q3",
        prompt:
          "How do you ensure data quality and accuracy in your analysis?",
        topic: "Data Quality & Validation Frameworks",
        skillTags: ["Validation Checks", "Version Control"],
        isFollowUp: false,
        personaTitle: "Lead Interviewer",
        targetFocalPoints:
          "Explain automated validation checks, cross-referencing, version control, and reproducibility.",
      },
      {
        id: "q4",
        prompt:
          "When evaluating automation tools like Playwright or Selenium, what criteria, protocol differences, and execution speed factors drive your framework architecture?",
        topic: "Automation Frameworks & Architecture",
        skillTags: ["CDP Protocols", "Test Decoupling"],
        isFollowUp: false,
        personaTitle: "Senior Architect",
        targetFocalPoints:
          "Compare CDP / BiDi protocols vs WebDriver wire protocol, auto-waiting mechanics, and isolation.",
      },
      {
        id: "q5",
        prompt:
          "How do you distinguish between legitimate regression bugs and flaky tests in CI/CD, and what quarantine workflows do you enforce?",
        topic: "CI/CD Flaky Triage & Pipeline Resilience",
        skillTags: ["Failure Quarantine", "SLA Governance"],
        isFollowUp: false,
        personaTitle: "Infrastructure Lead",
        targetFocalPoints:
          "Address retry budgets, test result telemetry, and non-blocking PR deployment gates.",
      },
    ];
  }

  async generateFollowUp(question: InterviewQuestion, answer: string): Promise<string | null> {
    if (question.id === "q1") {
      return "What challenges did you face during that project, and how did you overcome them?";
    }
    return null;
  }

  async evaluateAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluation> {
    const qId = input.question.id;
    const answer = input.candidateAnswer || "";

    if (qId === "q1") {
      return {
        score: 87,
        accuracy: 45,
        depth: 25,
        relevance: 17,
        statusTag: "Solid Execution",
        strengths: [
          "Well-structured explanation from business problem scoping through data pipeline synthesis.",
          "Clear linkage between analytical outputs and commercial stakeholder value.",
        ],
        missingDetails: [
          "Could touch on latency and cost tradeoffs when provisioning large cloud data warehouses.",
        ],
        improvementSuggestions: [
          "Include quantifiable metrics showing the dollar or conversion lift resulting from your findings.",
        ],
        evidence: [
          answer.slice(0, 140) ||
            "Walked through validation checks, ETL transformations, and dashboard delivery.",
        ],
        keyTakeaway:
          "Strong end-to-end analytical framing with high business relevance.",
        technicalDepth: 88,
        clarity: 92,
      };
    }

    if (qId === "q2") {
      return {
        score: 100,
        accuracy: 50,
        depth: 30,
        relevance: 20,
        statusTag: "Exemplary",
        strengths: [
          "Outstanding resilience in addressing asynchronous data mismatch and cross-team dependencies.",
          "Applied structured STAR methodology with quantifiable recovery timeline.",
        ],
        missingDetails: [],
        improvementSuggestions: [
          "Exemplary response; maintain this level of concrete trade-off articulation.",
        ],
        evidence: [
          answer.slice(0, 140) ||
            "Identified failure buckets early and coordinated with upstream teams to preserve SLAs.",
        ],
        keyTakeaway:
          "Mastery of conflict resolution, root-cause diagnostics, and rapid engineering recovery.",
        technicalDepth: 96,
        clarity: 95,
      };
    }

    if (qId === "q3") {
      return {
        score: 85,
        accuracy: 42,
        depth: 26,
        relevance: 17,
        statusTag: "Solid Execution",
        strengths: [
          "Comprehensive validation methodology including schema integrity, anomaly detection, and regression tests.",
          "Consistent documentation and version control discipline.",
        ],
        missingDetails: [
          "Mention automated alert thresholds when data distributions drift in production.",
        ],
        improvementSuggestions: [
          "Detail how CI/CD pipelines handle data testing prior to merge.",
        ],
        evidence: [
          answer.slice(0, 140) ||
            "Used validation checks, cross-referencing, and version control to maintain accuracy.",
        ],
        keyTakeaway: "Robust data quality discipline with structured reproducibility.",
        technicalDepth: 86,
        clarity: 89,
      };
    }

    // Default rubric for Q4, Q5
    const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
    const baseScore = Math.min(85, Math.max(68, 62 + Math.floor(wordCount / 4)));
    const finalScore = qId === "q4" ? 78 : qId === "q5" ? 74 : baseScore;

    return {
      score: finalScore,
      accuracy: 38,
      depth: 22,
      relevance: 15,
      statusTag: finalScore >= 80 ? "Solid Execution" : "Needs Attention",
      strengths: [
        "Solid conceptual grasp with practical operational awareness.",
        "Clear reasoning and communicative tone.",
      ],
      missingDetails: [
        "Include more concrete telemetry metrics and SLA criteria.",
      ],
      improvementSuggestions: [
        "Ground your answer in a specific production case study.",
      ],
      evidence: [answer.slice(0, 120) || "Discussed architecture and pipeline isolation."],
      keyTakeaway: "Good foundational knowledge with opportunities for deeper quantitative metrics.",
      technicalDepth: 78,
      clarity: 84,
    };
  }

  async generateReport(role: string, questions: InterviewQuestion[]): Promise<PracticeReport> {
    const scores = questions.map((q) => q.evaluation?.score ?? 75);
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length || 1)) * 10) / 10;

    return {
      overallScore: 72.5,
      finalScore: 72.5,
      focusLevel: 93,
      averageResponseTimeSec: 8.3,
      peerMedianDelta: 11,
      competencyConfidence: 85,
      strongestArea: {
        title: "Data Quality & Validation Frameworks",
        score: 92,
        description:
          "Exceptional accuracy in cross-referencing, version control, and reproducible pipelines.",
      },
      biggestOpportunity: {
        title: "Pipeline Resilience & Distributed Triage",
        score: 64,
        description:
          "Opportunity to detail automated quarantine buckets and non-blocking release gates.",
        questionId: "q5",
      },
      recommendedAction: {
        title: "Refine Pipeline Recovery & Flaky Triage",
        description: "Review telemetry protocols to ensure release pipelines remain unblocked.",
        targetQuestionId: "q5",
      },
      coachObservation:
        "Your responses demonstrated strong analytical composure, high accuracy, and calm communication under pressure.",
      evaluatedAnswers: questions,
    };
  }

  async generateFocusedQuestion(input: FocusedPracticeInput): Promise<FocusedPracticeData> {
    return {
      drillStep: "TARGETED DRILL • EMPATHY REHEARSAL",
      skillInFocus: "Data Quality & Anomaly Containment",
      category: "Analytical Rigor & Resilience",
      whyPreviousNeededWork:
        "Your previous response had strong validation principles, but skipped how to maintain test stability when builds fail in automated deployment pipelines.",
      keyPoints: [
        { id: 1, title: "Quarantine", detail: "Mention automatic retries with quarantine (quarantine suite vs blocking build)." },
        { id: 2, title: "Root-Cause", detail: "Breakdown: infra vs app bug vs stale schema before re-running." },
        { id: 3, title: "Governance", detail: "Propose an SLA for fixing or pruning flaky tests to avoid alert fatigue." },
      ],
      newTargetedQuestion:
        "“When data validations fail intermittently in your pull request pipeline, what step-by-step process do you follow to isolate, triage, and resolve the issue without blocking releases?”",
      idealWordRange: { min: 70, max: 120 },
      originalScore: input.evaluation.score || 58,
      keyConceptTriggers: [
        { id: "quarantine", label: "Quarantine mentioned", regex: "quarantine|isolate|non-blocking" },
        { id: "rootcause", label: "Root-cause logs", regex: "root-cause|logs|video|artifacts|inspect" },
        { id: "sla", label: "Needs SLA metric", regex: "sla|hours|days|prun|ticket" },
      ],
    };
  }

  async evaluateRetry(input: EvaluateRetryInput): Promise<FocusedEvaluationResult> {
    const text = input.retryAnswer.toLowerCase();
    const hasQuarantine = /quarantine|isolate|bucket/i.test(text);
    const hasRootCause = /root[- ]?cause|inspect|logs|artifacts/i.test(text);
    const hasSla = /sla|hour|day|ticket|metric/i.test(text);

    let reattemptScore = 78;
    if (hasQuarantine && hasRootCause && hasSla) reattemptScore = 89;
    else if (hasQuarantine || hasRootCause) reattemptScore = 82;

    const delta = reattemptScore - input.originalScore;

    return {
      originalScore: input.originalScore || 58,
      reattemptScore,
      scoreDelta: delta > 0 ? delta : 31,
      whatChanged: "Added specific quarantine protocol that unblocks feature teams without silently passing defective code.",
      conceptsAdded: [
        "Root-cause triage differentiating infra vs test code",
        "Definite SLA metrics (e.g., 48-hour fix-or-drop quarantine cycle)",
      ],
      drillReliability: "Top 12% Candidate",
    };
  }
}
