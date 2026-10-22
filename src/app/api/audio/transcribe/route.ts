import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const contextRole = (formData.get("role") as string) || "Software Engineer";
    const questionTopic = (formData.get("topic") as string) || "Technical Interview";

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 500) {
      return NextResponse.json(
        { success: false, error: "Audio recording was too short or empty." },
        { status: 400 }
      );
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    // 1. Try Groq Whisper (Ultra-fast, whisper-large-v3-turbo, highest accuracy for technical terminology)
    if (groqKey) {
      try {
        const groqFormData = new FormData();
        const groqBlob = new Blob([buffer], { type: audioFile.type || "audio/webm" });
        groqFormData.append("file", groqBlob, "recording.webm");
        groqFormData.append("model", "whisper-large-v3-turbo");
        groqFormData.append("temperature", "0");
        groqFormData.append(
          "prompt",
          `Technical interview response for ${contextRole} on topic ${questionTopic}. Terminology: CI/CD, Page Object Model, POM, Playwright, Selenium, data-testid, shadow DOM, flakiness, SLA.`
        );

        const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
          },
          body: groqFormData,
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          if (data.text?.trim()) {
            return NextResponse.json({
              success: true,
              text: data.text.trim(),
              provider: "groq-whisper-v3",
            });
          }
        }
      } catch (e) {
        console.warn("Groq whisper transcription failed, falling back to next provider:", e);
      }
    }

    // 2. Try OpenAI Whisper (whisper-1)
    if (openaiKey) {
      try {
        const oaiFormData = new FormData();
        const oaiBlob = new Blob([buffer], { type: audioFile.type || "audio/webm" });
        oaiFormData.append("file", oaiBlob, "recording.webm");
        oaiFormData.append("model", "whisper-1");
        oaiFormData.append("temperature", "0");
        oaiFormData.append(
          "prompt",
          `Technical interview answer regarding ${contextRole}, CI/CD, POM, Selenium, Playwright, SLA.`
        );

        const oaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
          },
          body: oaiFormData,
        });

        if (oaiRes.ok) {
          const data = await oaiRes.json();
          if (data.text?.trim()) {
            return NextResponse.json({
              success: true,
              text: data.text.trim(),
              provider: "openai-whisper",
            });
          }
        }
      } catch (e) {
        console.warn("OpenAI whisper transcription failed, falling back to next provider:", e);
      }
    }

    // 3. Try Gemini Multimodal Audio (Gemini 1.5 Flash natively processes audio with technical precision)
    if (geminiKey && (geminiKey.startsWith("AIza") || process.env.AI_PROVIDER === "gemini")) {
      try {
        const mimeType = audioFile.type && audioFile.type.includes("audio") ? audioFile.type : "audio/webm";
        const base64Data = buffer.toString("base64");

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inlineData: {
                        mimeType,
                        data: base64Data,
                      },
                    },
                    {
                      text: `You are an ultra-high precision technical audio transcription model. 
Transcribe this spoken interview answer word-for-word with exact grammar, punctuation, and technical terms.
Ensure correct capitalization and spelling for engineering frameworks, tools, and acronyms (such as CI/CD, Page Object Model, POM, Playwright, Selenium, data-testid, DOM, shadow DOM, SLA, Datadog, Docker, Kubernetes, etc.).
Output ONLY the clean transcription text, without introductory notes, markdown quotes, or formatting.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (transcript?.trim()) {
            return NextResponse.json({
              success: true,
              text: transcript.trim(),
              provider: "gemini-audio",
            });
          }
        }
      } catch (e) {
        console.warn("Gemini audio transcription failed:", e);
      }
    }

    // If no hosted STT API key is configured
    return NextResponse.json(
      {
        success: false,
        error:
          "No hosted speech-to-text API key is configured. Please configure GROQ_API_KEY (Groq Whisper), OPENAI_API_KEY (OpenAI Whisper), or GEMINI_API_KEY in .env.local, or use real-time browser voice dictation.",
        requiresKey: true,
      },
      { status: 503 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to transcribe audio.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
