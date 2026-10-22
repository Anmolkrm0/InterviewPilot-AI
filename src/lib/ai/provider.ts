import { InterviewAIProvider } from "./types";
import { MockAIProvider } from "./mock-provider";
import { GeminiProvider } from "./gemini-provider";

export class AIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIConfigurationError";
  }
}

let cachedProvider: InterviewAIProvider | null = null;

export function getAIProvider(): InterviewAIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerType = (process.env.AI_PROVIDER || "").toLowerCase().trim();
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
  const model = process.env.AI_MODEL;

  // Explicit mock provider
  if (providerType === "mock" || process.env.NODE_ENV === "test") {
    cachedProvider = new MockAIProvider();
    return cachedProvider;
  }

  // If Gemini or key starts with AIza...
  if (providerType === "gemini" || (!providerType && apiKey.startsWith("AIza"))) {
    if (!apiKey) {
      throw new AIConfigurationError(
        "AI_PROVIDER is set to 'gemini' but AI_API_KEY is missing. Please configure AI_API_KEY in your environment."
      );
    }
    cachedProvider = new GeminiProvider(apiKey, model || "gemini-1.5-flash");
    return cachedProvider;
  }

  // If no credentials and no provider specified
  if (!apiKey && (!providerType || providerType === "none")) {
    // If running in development without any keys, default to Mock provider so local testers can see it working immediately,
    // but in production throw configuration error.
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ No AI_API_KEY found. Defaulting to high-fidelity MockAIProvider in development mode.");
      cachedProvider = new MockAIProvider();
      return cachedProvider;
    }

    throw new AIConfigurationError(
      "AI provider not configured. Please set AI_PROVIDER (e.g. 'gemini', 'mock') and AI_API_KEY in your environment variables."
    );
  }

  // Default fallback to Mock if providerType === "mock"
  cachedProvider = new MockAIProvider();
  return cachedProvider;
}
