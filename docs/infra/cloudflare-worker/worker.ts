import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { createGeminiText } from "@tanstack/ai-gemini";
import { ALLOWED_MODELS } from "../../src/app/components/constants";

// Populated at build time by pnpm worker:build-context
// Falls back to empty string if file hasn't been generated yet
let SYSTEM_PROMPT = "";
try {
  const ctx = await import("./docs-context.js");
  SYSTEM_PROMPT = ctx.SYSTEM_PROMPT ?? "";
} catch {
  // docs-context.js not yet generated — run pnpm worker:build-context
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Record<string, string>) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "POST") {
      return new Response("Not allowed", {
        status: 405,
        headers: CORS_HEADERS,
      });
    }

    const key = env.GEMINI_API_KEY;
    if (!key) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        },
      );
    }

    let body: {
      messages?: Array<{ role: string; content: string }>;
      model?: string;
    };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // Model comes from the URL query string (?model=...) set by ChatPanel.tsx.
    // Fall back to body.model for forward-compatibility, then to the default.
    const url = new URL(request.url);
    const model =
      url.searchParams.get("model") ?? body.model ?? "gemini-2.5-flash";
    if (!ALLOWED_MODELS.includes(model)) {
      return new Response(JSON.stringify({ error: "Model not allowed" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const messages = (body.messages ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const geminiAdapter = createGeminiText(key);
    const stream = chat({
      adapter: geminiAdapter(model),
      system: SYSTEM_PROMPT || undefined,
      messages,
    });

    const sseResponse = toServerSentEventsResponse(stream);
    // Merge CORS headers into the SSE response
    const headers = new Headers(sseResponse.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      headers.set(k, v);
    }
    return new Response(sseResponse.body, {
      status: sseResponse.status,
      headers,
    });
  },
};
