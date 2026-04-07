/**
 * Pure utilities for parsing Gemini SSE (Server-Sent Events) stream lines.
 *
 * SSE = Server-Sent Events — a W3C standard for unidirectional server→client
 * streaming over plain HTTP. The browser keeps a long-lived connection open
 * and the server pushes newline-delimited "data: …" frames. No WebSocket
 * handshake required. Gemini uses it for streamed text completions via the
 * `?alt=sse` query parameter. As of 2026 it remains the most widely-supported
 * streaming primitive across AI providers.
 *
 * No React, no side effects — easy to unit-test independently.
 *
 * Gemini's streaming format:
 *   data: {"candidates":[{"content":{"parts":[{"text":"…"}]}}]}
 *   data: [DONE]
 */

export type SseDelta =
  | { type: "text"; text: string }
  | { type: "error"; message: string }
  | { type: "done" }
  | { type: "skip" };

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
  finishReason?: string;
}

interface GeminiChunk {
  candidates?: GeminiCandidate[];
  error?: { message?: string };
}

export function parseGeminiSseLine(line: string): SseDelta {
  const trimmed = line.trim();

  if (!trimmed.startsWith("data:")) return { type: "skip" };

  const payload = trimmed.slice(5).trim();

  if (payload === "[DONE]") return { type: "done" };

  let chunk: GeminiChunk;
  try {
    chunk = JSON.parse(payload) as GeminiChunk;
  } catch {
    return { type: "skip" };
  }

  if (chunk.error?.message) {
    return { type: "error", message: chunk.error.message };
  }

  const candidate = chunk.candidates?.[0];
  if (!candidate) return { type: "skip" };

  if (
    candidate.finishReason &&
    candidate.finishReason !== "STOP" &&
    candidate.finishReason !== "MAX_TOKENS"
  ) {
    return {
      type: "error",
      message: `Generation stopped: ${candidate.finishReason}`,
    };
  }

  const text =
    candidate.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  if (!text) return { type: "skip" };

  return { type: "text", text };
}
