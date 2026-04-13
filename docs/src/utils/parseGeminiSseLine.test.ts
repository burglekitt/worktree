import { parseGeminiSseLine } from "./parseGeminiSseLine";

// ── Helpers ───────────────────────────────────────────────────────────────────

interface CandidateOptions {
  text?: string;
  parts?: Array<{ text?: string }>;
  finishReason?: string;
}

/** Build a well-formed `data: …` line with a single Gemini candidate. */
function candidateLine(opts: CandidateOptions = {}): string {
  const parts = opts.parts ?? [{ text: opts.text ?? "hello" }];
  const candidate: Record<string, unknown> = { content: { parts } };
  if (opts.finishReason) candidate.finishReason = opts.finishReason;
  return `data: ${JSON.stringify({ candidates: [candidate] })}`;
}

// ── skip ──────────────────────────────────────────────────────────────────────

describe("parseGeminiSseLine — skip", () => {
  it("empty string", () => {
    expect(parseGeminiSseLine("")).toEqual({ type: "skip" });
  });

  it("whitespace-only line", () => {
    expect(parseGeminiSseLine("   ")).toEqual({ type: "skip" });
  });

  it("SSE event line (no data: prefix)", () => {
    expect(parseGeminiSseLine("event: message")).toEqual({ type: "skip" });
  });

  it("SSE comment line", () => {
    expect(parseGeminiSseLine(": keep-alive")).toEqual({ type: "skip" });
  });

  it("data line with only whitespace after prefix", () => {
    expect(parseGeminiSseLine("data:   ")).toEqual({ type: "skip" });
  });

  it("malformed JSON after data prefix", () => {
    expect(parseGeminiSseLine("data: {bad json}")).toEqual({ type: "skip" });
  });

  it("empty JSON object (no candidates key)", () => {
    expect(parseGeminiSseLine("data: {}")).toEqual({ type: "skip" });
  });

  it("empty candidates array", () => {
    expect(
      parseGeminiSseLine(`data: ${JSON.stringify({ candidates: [] })}`),
    ).toEqual({ type: "skip" });
  });

  it("candidate with all-empty text parts", () => {
    expect(
      parseGeminiSseLine(candidateLine({ parts: [{ text: "" }] })),
    ).toEqual({ type: "skip" });
  });

  it("finishReason STOP but no text", () => {
    expect(
      parseGeminiSseLine(candidateLine({ text: "", finishReason: "STOP" })),
    ).toEqual({ type: "skip" });
  });
});

// ── done ──────────────────────────────────────────────────────────────────────

describe("parseGeminiSseLine — done", () => {
  it("the [DONE] sentinel", () => {
    expect(parseGeminiSseLine("data: [DONE]")).toEqual({ type: "done" });
  });
});

// ── text ──────────────────────────────────────────────────────────────────────

describe("parseGeminiSseLine — text", () => {
  it("single-part candidate", () => {
    expect(parseGeminiSseLine(candidateLine({ text: "hello world" }))).toEqual({
      type: "text",
      text: "hello world",
    });
  });

  it("multi-part candidate — parts are joined into one string", () => {
    expect(
      parseGeminiSseLine(
        candidateLine({ parts: [{ text: "foo" }, { text: "bar" }] }),
      ),
    ).toEqual({ type: "text", text: "foobar" });
  });

  it("part with undefined text field is treated as empty string", () => {
    expect(
      parseGeminiSseLine(candidateLine({ parts: [{ text: "ok" }, {}] })),
    ).toEqual({ type: "text", text: "ok" });
  });

  it("finishReason STOP with text present", () => {
    expect(
      parseGeminiSseLine(
        candidateLine({ text: "done!", finishReason: "STOP" }),
      ),
    ).toEqual({ type: "text", text: "done!" });
  });

  it("finishReason MAX_TOKENS with text present", () => {
    expect(
      parseGeminiSseLine(
        candidateLine({ text: "truncated", finishReason: "MAX_TOKENS" }),
      ),
    ).toEqual({ type: "text", text: "truncated" });
  });
});

// ── error ─────────────────────────────────────────────────────────────────────

describe("parseGeminiSseLine — error", () => {
  it("chunk-level error.message (e.g. quota exceeded)", () => {
    const line = `data: ${JSON.stringify({ error: { message: "quota exceeded" } })}`;
    expect(parseGeminiSseLine(line)).toEqual({
      type: "error",
      message: "quota exceeded",
    });
  });

  it("finishReason SAFETY", () => {
    expect(
      parseGeminiSseLine(candidateLine({ finishReason: "SAFETY" })),
    ).toEqual({ type: "error", message: "Generation stopped: SAFETY" });
  });

  it("finishReason RECITATION", () => {
    expect(
      parseGeminiSseLine(candidateLine({ finishReason: "RECITATION" })),
    ).toEqual({ type: "error", message: "Generation stopped: RECITATION" });
  });

  it("finishReason OTHER", () => {
    expect(
      parseGeminiSseLine(candidateLine({ finishReason: "OTHER" })),
    ).toEqual({ type: "error", message: "Generation stopped: OTHER" });
  });
});
