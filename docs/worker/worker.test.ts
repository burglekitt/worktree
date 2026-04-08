import { afterEach, describe, expect, it, vi } from "vitest";

// Hoist before the worker import so the generated file is never loaded from disk.
vi.mock("./docs-context.js", () => ({ SYSTEM_PROMPT: "" }));

import worker from "./worker";

// ── Helpers ───────────────────────────────────────────────────────────────────

function sseStream(lines: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(ctrl) {
      for (const l of lines) ctrl.enqueue(enc.encode(`${l}\n`));
      ctrl.close();
    },
  });
}

function postReq(opts: {
  url?: string;
  origin?: string;
  body?: unknown;
}): Request {
  const {
    url = "https://worker.example.com/?model=gemini-2.5-flash",
    origin = "https://burglekitt.github.io",
    body,
  } = opts;
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const ENV = { GEMINI_API_KEY: "test-key" };
const VALID_BODY = { messages: [{ role: "user", content: "hi" }] };

// ── Tests ─────────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("worker — method guards", () => {
  it("OPTIONS → 204 with CORS headers", async () => {
    const res = await worker.fetch(
      new Request("https://worker.example.com/", {
        method: "OPTIONS",
        headers: { Origin: "https://burglekitt.github.io" },
      }),
      ENV,
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://burglekitt.github.io",
    );
  });

  it("GET → 405", async () => {
    const res = await worker.fetch(
      new Request("https://worker.example.com/", {
        method: "GET",
        headers: { Origin: "https://burglekitt.github.io" },
      }),
      ENV,
    );
    expect(res.status).toBe(405);
  });
});

describe("worker — request validation", () => {
  it("missing GEMINI_API_KEY → 500", async () => {
    const res = await worker.fetch(postReq({ body: VALID_BODY }), {});
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("GEMINI_API_KEY not configured");
  });

  it("invalid JSON body → 400", async () => {
    const res = await worker.fetch(
      new Request("https://worker.example.com/?model=gemini-2.5-flash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://burglekitt.github.io",
        },
        body: "not-json",
      }),
      ENV,
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Invalid JSON");
  });

  it("unknown model → 400", async () => {
    const res = await worker.fetch(
      new Request("https://worker.example.com/?model=gpt-4-turbo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://burglekitt.github.io",
        },
        body: JSON.stringify(VALID_BODY),
      }),
      ENV,
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Model not allowed");
  });
});

describe("worker — happy path", () => {
  it("SSE stream proxied to client with correct headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            sseStream([
              'data: {"candidates":[{"content":{"parts":[{"text":"hello"}]}}]}',
              "data: [DONE]",
            ]),
            { status: 200, headers: { "Content-Type": "text/event-stream" } },
          ),
        ),
    );

    const res = await worker.fetch(postReq({ body: VALID_BODY }), ENV);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("Cache-Control")).toBe("no-cache");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://burglekitt.github.io",
    );
    const text = await res.text();
    expect(text).toContain('"text":"hello"');
  });

  it("model from query param is forwarded to Gemini URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(sseStream(["data: [DONE]"]), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await worker.fetch(
      new Request("https://worker.example.com/?model=gemini-2.5-flash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://burglekitt.github.io",
        },
        body: JSON.stringify(VALID_BODY),
      }),
      ENV,
    );

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("gemini-2.5-flash:streamGenerateContent");
    expect(calledUrl).toContain("alt=sse");
  });
});

describe("worker — upstream errors", () => {
  it("upstream 429 → rate limit message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "quota exceeded" } }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const res = await worker.fetch(postReq({ body: VALID_BODY }), ENV);
    expect(res.status).toBe(429);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain(
      "Rate limit reached for this model. Please switch to a different model.",
    );
  });

  it("upstream 503 → parsed status: message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: 503,
              message:
                "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
              status: "UNAVAILABLE",
            },
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const res = await worker.fetch(postReq({ body: VALID_BODY }), ENV);
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe(
      "UNAVAILABLE: This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
    );
  });
});

describe("worker — CORS", () => {
  it("localhost origin is reflected", async () => {
    const res = await worker.fetch(
      new Request("https://worker.example.com/", {
        method: "OPTIONS",
        headers: { Origin: "http://localhost:3000" },
      }),
      ENV,
    );
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000",
    );
  });

  it("disallowed origin falls back to burglekitt.github.io", async () => {
    const res = await worker.fetch(
      new Request("https://worker.example.com/", {
        method: "OPTIONS",
        headers: { Origin: "https://evil.example.com" },
      }),
      ENV,
    );
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://burglekitt.github.io",
    );
  });
});
