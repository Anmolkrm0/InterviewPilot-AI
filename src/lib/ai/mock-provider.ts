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
    const isSdet =
      input.role.toLowerCase().includes("qa") ||
      input.role.toLowerCase().includes("sdet") ||
      input.role.toLowerCase().includes("test") ||
      input.jobDescriptionText.toLowerCase().includes("selenium") ||
      input.jobDescriptionText.toLowerCase().includes("playwright");

    if (isSdet) {
      return [
        {
          id: "q1",
          prompt:
            "When evaluating Selenium versus modern browser automation tools like Playwright or Cypress for a large-scale web application, what architectural criteria, execution speed factors, and protocol differences drive your decision?",
          topic: "Selenium vs Playwright evaluation criteria",
          skillTags: ["Automation Frameworks", "Protocol Architecture"],
          personaTitle: "Lead SDET & Architect",
          targetFocalPoints:
            "Compare CDP (Chrome DevTools Protocol) / BiDi vs WebDriver HTTP JSON wire, auto-waiting, and isolation.",
        },
        {
          id: "q2",
          prompt:
            "“Your resume mentions Selenium automation. How would you design a test automation framework for a web application with frequent UI changes?”",
          topic: "Test automation with dynamic UI",
          skillTags: ["Technical Architecture", "Automated Testing"],
          personaTitle: "Senior Staff SDET & Systems Architect",
          targetFocalPoints:
            "Speak to component-based locators, Page Object Model (POM), or resilient wait strategies.",
        },
        {
          id: "q3",
          prompt:
            "How do you distinguish between legitimate regression bugs and flaky tests in a high-volume CI/CD pipeline, and what quarantine workflows do you enforce?",
          topic: "CI/CD Flaky test triage",
          skillTags: ["CI/CD Pipelines", "Failure Triage"],
          personaTitle: "DevOps & Quality Lead",
          targetFocalPoints:
            "Detail retry budgets, test quarantine buckets, test result telemetry, and developer notification thresholds.",
        },
        {
          id: "q4",
          prompt:
            "Tell me about a time you had a strong technical disagreement with a Lead Architect or Product Manager regarding test coverage versus shipping deadlines. How did you negotiate risk?",
          topic: "Behavioral: Disagreement with Lead Architect",
          skillTags: ["Stakeholder Management", "Risk Assessment"],
          personaTitle: "Director of Quality Engineering",
          targetFocalPoints:
            "Use STAR framework: describe quantifiable quality metrics, risk matrix tradeoffs, and mutual resolution.",
        },
        {
          id: "q5",
          prompt:
            "How would you design a distributed cross-browser load and performance testing suite simulating thousands of concurrent sessions for a latency-sensitive trading portal?",
          topic: "Cross-browser load strategy",
          skillTags: ["Performance Testing", "Scale & Concurrency"],
          personaTitle: "Principal Infrastructure Architect",
          targetFocalPoints:
            "Address headless execution clusters, network throttling, memory leak detection, and Grafana/Datadog reporting.",
        },
      ];
    }

    // Generic fallback questions tailored to the input role
    const role = input.role || "Software Engineer";
    return [
      {
        id: "q1",
        prompt: `Can you walk me through the system architecture of the most challenging project you led as a ${role}, and the key technical tradeoffs you made?`,
        topic: `${role} Architecture & Tradeoffs`,
        skillTags: ["System Design", "Technical Architecture"],
        personaTitle: "Staff Systems Architect",
        targetFocalPoints: "Focus on scalability limits, modular boundaries, and database consistency choices.",
      },
      {
        id: "q2",
        prompt: `When designing for high reliability and rapid deployment in your ${role} workflow, how do you handle automated testing and failure recovery?`,
        topic: "Resilience & Automated Testing",
        skillTags: ["Reliability", "Continuous Delivery"],
        personaTitle: "Principal Engineering Lead",
        targetFocalPoints: "Explain automated smoke testing, circuit breakers, and canary release strategies.",
      },
      {
        id: "q3",
        prompt: `Describe a situation where a production incident occurred under your watch. What was your diagnosis methodology and long-term prevention plan?`,
        topic: "Incident Triage & Root Cause Analysis",
        skillTags: ["Troubleshooting", "Observability"],
        personaTitle: "Head of Infrastructure",
        targetFocalPoints: "Demonstrate structured log/metric analysis, blameless post-mortem, and corrective action items.",
      },
      {
        id: "q4",
        prompt: `Tell me about a project where product requirements changed midway through delivery. How did you reprioritize architecture without compromising quality?`,
        topic: "Behavioral: Requirement Volatility & Delivery",
        skillTags: ["Agile Prioritization", "Stakeholder Communication"],
        personaTitle: "Director of Product Engineering",
        targetFocalPoints: "Apply STAR framework: show stakeholder alignment, feature scoping, and pragmatic compromises.",
      },
      {
        id: "q5",
        prompt: `How do you mentor junior and mid-level engineers on your team to cultivate best practices in code quality, documentation, and system design?`,
        topic: "Engineering Mentorship & Culture",
        skillTags: ["Leadership", "Code Quality"],
        personaTitle: "Engineering VP",
        targetFocalPoints: "Highlight pair programming, PR review rubrics, design doc walkthroughs, and knowledge sharing.",
      },
    ];
  }

  async generateFollowUp(question: InterviewQuestion, answer: string): Promise<string | null> {
    if (answer.length < 50) {
      return "Could you elaborate on specific tools, frameworks, and metrics you would use in a production setting?";
    }
    return null;
  }

  async evaluateAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluation> {
    const qId = input.question.id;
    const answer = input.candidateAnswer || "";

    // If evaluating Q2 from the SDET screenshot
    if (qId === "q2") {
      const mentionsPom = /page\s*object|pom|locator|data-testid/i.test(answer);
      const mentionsCi = /ci\/cd|quarantine|flaky|retry|pipeline|shadow\s*dom/i.test(answer);

      const score = mentionsCi && mentionsPom ? 85 : mentionsPom ? 62 : 55;

      return {
        score,
        statusTag: score >= 80 ? "Solid Execution" : "Needs Attention",
        strengths: [
          "Good structural separation using Page Object Model and reliable resilient locator strategies with data-testid.",
          "Clear emphasis on test maintainability and isolating DOM queries from test assertion logic.",
        ],
        missingDetails: [
          "Did not address automated test retry policies, failure quarantine buckets, or handling asynchronous shadow DOM elements and micro-frontend rendering shifts.",
          "Omitted how pull request deployment gates distinguish between genuine software regressions and environment blips.",
        ],
        improvementSuggestions: [
          "Detail how CI/CD pipelines handle false positives and how flaky tests are isolated into quarantine without halting critical pull-request deployment gates.",
          "Incorporate visual regression snapshot verification or semantic accessibility locators for brittle UI widgets.",
        ],
        evidence: [
          "Focused primarily on structuring tests with the Page Object Model, abstracting DOM element locators using stable data-testid tags.",
        ],
        improvedAnswerExample: {
          title: "Example of a Stronger Answer (STAR Framework)",
          starOutlineText:
            "[Situation]: In a high-frequency FinTech trading portal with continuous micro-frontend deployments...\n[Task]: I needed to design an automated test framework resilient to DOM shifts and pipeline bottlenecks...\n[Action]: I decoupled locator catalogs from execution steps, enforced data-testid tagging, and implemented automated retry quarantine buckets in GitHub Actions/GitLab CI...\n[Result]: Flaky test pipeline blockers decreased by 74% while maintaining 98% release confidence.",
          sections: [
            {
              heading: "Architecture & Resilience",
              content:
                "I decouple locator catalogs from execution steps via autonomous Page Component models. Locators default to custom semantic telemetry attributes (data-qa), backed by visual baseline snapshots for layout-shift resilience.",
            },
            {
              heading: "Pipeline Containment",
              content:
                "To prevent blocking pull requests, tests that fail twice in ephemeral environments are auto-flagged into a quarantine matrix via Datadog webhooks, creating a Jira ticket while keeping the deployment gate unblocked.",
            },
          ],
        },
        keyTakeaway:
          "Strong baseline locator modularity, but requires end-to-end CI/CD failure containment and pipeline isolation protocols.",
        technicalDepth: 74,
        clarity: 82,
      };
    }

    if (qId === "q1") {
      return {
        score: 88,
        statusTag: "Solid Execution",
        strengths: [
          "Clear comparative matrix highlighting bi-directional CDP protocols, native auto-waiting mechanics, and browser context isolation tradeoffs.",
          "Accurately assessed parallel execution overhead and cross-browser engine fidelity.",
        ],
        missingDetails: [
          "Could touch briefly on legacy browser support constraints if enterprise client matrix requires older Internet Explorer/Edge engines.",
        ],
        improvementSuggestions: [
          "Provide concrete benchmark numbers on execution speed improvements observed when migrating test suites.",
        ],
        evidence: [
          "Explained bidirectional event listening over WebSocket connections versus synchronous HTTP polling in traditional Selenium.",
        ],
        keyTakeaway:
          "Clear comparative matrix highlighting bi-directional CDP protocols, native auto-waiting mechanics, and browser context isolation tradeoffs.",
        technicalDepth: 92,
        clarity: 86,
      };
    }

    // Default rubric calculation for Q3, Q4, Q5
    const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
    const baseScore = Math.min(85, Math.max(65, 60 + Math.floor(wordCount / 4)));
    const finalScore = qId === "q3" ? 78 : qId === "q4" ? 81 : qId === "q5" ? 71 : baseScore;

    return {
      score: finalScore,
      statusTag: finalScore >= 80 ? "Solid Execution" : "Needs Attention",
      strengths: [
        "Identified core engineering principles and structured reasoning logically.",
        "Demonstrated familiarity with production delivery constraints.",
      ],
      missingDetails: [
        "Include more concrete telemetry metrics (e.g. p99 latencies, failure MTTR, test flakiness rates).",
      ],
      improvementSuggestions: [
        "Ground your answer in a specific STAR framework project story to make the trade-offs tangible.",
      ],
      evidence: [answer.slice(0, 120) + (answer.length > 120 ? "..." : "")],
      keyTakeaway: "Demonstrated solid technical domain grasp with practical operational awareness.",
      technicalDepth: 78,
      clarity: 84,
    };
  }

  async generateReport(role: string, questions: InterviewQuestion[]): Promise<PracticeReport> {
    const scores = questions.map((q) => q.evaluation?.score ?? 70);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

    // Find the question with the lowest score for targeted practice
    let minScore = 101;
    let weakestQ = questions[0];
    for (const q of questions) {
      const s = q.evaluation?.score ?? 70;
      if (s < minScore) {
        minScore = s;
        weakestQ = q;
      }
    }

    return {
      overallScore: avgScore || 76,
      peerMedianDelta: 11,
      competencyConfidence: avgScore || 76,
      strongestArea: {
        title: "Test Architecture & Locator Strategies",
        score: 90,
        description:
          "Excellent structural decoupling, resilient selector principles, and clean domain isolation.",
      },
      biggestOpportunity: {
        title: "CI/CD Failure Handling & Flaky Triage",
        score: minScore || 58,
        description:
          "Gaps identified around quarantine workflows, distributed queue retries, and non-blocking pipelines.",
        questionId: weakestQ?.id || "q2",
      },
      recommendedAction: {
        title: `Turn your ${minScore || 62} into an 85+`,
        description:
          `Rehearse Question 2 using the structured STAR template and recommended pipeline recovery terminology.`,
        targetQuestionId: weakestQ?.id || "q2",
      },
      coachObservation:
        "Your technical foundations are in the 88th percentile. Focusing your next session on orchestration and failure containment will unlock senior SDET criteria.",
      evaluatedAnswers: questions,
    };
  }

  async generateFocusedQuestion(input: FocusedPracticeInput): Promise<FocusedPracticeData> {
    return {
      drillStep: "TARGETED DRILL #2 OF 3 • CONTINUOUS REFINEMENT MODE",
      skillInFocus: "CI/CD Pipeline Triage & Flaky Test Management",
      category: "System Health & Reliability",
      whyPreviousNeededWork:
        "Your previous answer explained Page Objects well, but skipped how to maintain test stability when builds fail in automated deployment pipelines.",
      keyPoints: [
        {
          id: 1,
          title: "Quarantine",
          detail: "Mention automatic retries with quarantine (quarantine suite vs blocking build).",
        },
        {
          id: 2,
          title: "Root-Cause",
          detail: "Breakdown: infra vs app bug vs stale locator before re-running.",
        },
        {
          id: 3,
          title: "Governance",
          detail: "Propose an SLA for fixing or pruning flaky tests to avoid alert fatigue.",
        },
      ],
      newTargetedQuestion:
        "“When automated tests fail intermittently in your pull request pipeline, what step-by-step process do you follow to isolate, triage, and resolve the flakiness without blocking releases?”",
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

    let reattemptScore = 75;
    if (hasQuarantine && hasRootCause && hasSla) reattemptScore = 89;
    else if (hasQuarantine || hasRootCause) reattemptScore = 82;

    const delta = reattemptScore - input.originalScore;

    return {
      originalScore: input.originalScore || 58,
      reattemptScore,
      scoreDelta: delta > 0 ? delta : 31,
      whatChanged:
        "Added specific quarantine protocol that unblocks feature teams without silently passing defective code.",
      conceptsAdded: [
        "Root-cause triage differentiating infra vs test code",
        "Definite SLA metrics (e.g., 48-hour fix-or-drop quarantine cycle)",
      ],
      drillReliability: "Top 12% Candidate",
    };
  }
}
