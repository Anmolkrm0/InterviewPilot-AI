import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { validateSafeUrl, SecurityError } from "@/lib/security/ssrf-validator";

const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2MB
const REQUEST_TIMEOUT_MS = 8000; // 8 seconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body?.url?.trim();

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid job posting URL." },
        { status: 400 }
      );
    }

    // SSRF security check
    const safeUrl = await validateSafeUrl(rawUrl);

    // Fetch with timeout and custom User-Agent
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(safeUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This job board is protected against automated fetching (HTTP 403/401). Please copy and paste the job description text directly.",
          },
          { status: 422 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `Job posting returned status ${response.status}. Please paste the description directly.`,
        },
        { status: 422 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return NextResponse.json(
        {
          success: false,
          error: "The provided URL did not return an HTML page.",
        },
        { status: 422 }
      );
    }

    const html = await response.text();
    if (html.length > MAX_RESPONSE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description page is too large to extract safely. Please paste the text directly.",
        },
        { status: 413 }
      );
    }

    const $ = cheerio.load(html);

    // Clean out non-content elements
    $("script, style, noscript, nav, header, footer, svg, iframe, form").remove();

    // Prefer main or article if present, otherwise body
    let rawText = "";
    if ($("main").length > 0) {
      rawText = $("main").text();
    } else if ($("article").length > 0) {
      rawText = $("article").text();
    } else if ($('[role="main"]').length > 0) {
      rawText = $('[role="main"]').text();
    } else {
      rawText = $("body").text();
    }

    // Collapse whitespace
    const cleanText = rawText
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n\n")
      .trim();

    if (!cleanText || cleanText.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract sufficient text from this URL (it may require JavaScript rendering). Please paste the text manually.",
        },
        { status: 422 }
      );
    }

    // Keyword detection for tech stack
    const techCatalog = [
      "Playwright",
      "Selenium",
      "Cypress",
      "CI/CD",
      "Microservices",
      "Python",
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "Kafka",
      "PostgreSQL",
      "GraphQL",
      "REST APIs",
      "Jest",
    ];

    const detectedTechStack: string[] = [];
    for (const tech of techCatalog) {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(cleanText)) {
        detectedTechStack.push(tech);
      }
    }

    return NextResponse.json({
      success: true,
      url: rawUrl,
      text: cleanText.slice(0, 5000),
      detectedTechStack: detectedTechStack.slice(0, 6),
      characterCount: cleanText.length,
    });
  } catch (err: unknown) {
    if (err instanceof SecurityError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 403 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to fetch URL.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
