import { chat, toServerSentEventsResponse } from "@tanstack/ai";

type RequestBody = {
  messages: Array<{ role: string; content: string }>;
  conversationId?: string | null;
};

export async function POST(request: Request) {
  const key = process.env.WORKTREE_OPENROUTER_API_KEY;
  if (!key) {
    return new Response(
      JSON.stringify({ error: "WORKTREE_OPENROUTER_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const url = new URL(request.url);
  const queryModel = url.searchParams.get("model") || undefined;

  const {
    messages,
    conversationId,
    model: bodyModel,
  } = (await request.json()) as RequestBody & { model?: string };

  const model = bodyModel || queryModel || "openai/gpt-5.2";

  try {
    // Try to dynamically import the TanStack OpenRouter adapter and discover
    // a usable adapter factory or client export. This keeps the runtime safe
    // if the package shape changes between versions.
    const mod = await import("@tanstack/ai-openrouter");

    const candidates = [
      mod.openrouterText,
      mod.openRouterText,
      mod.openRouter,
      mod.OpenRouter,
      mod.OpenRouterAdapter,
      mod.default,
    ];

    let adapter: any;

    for (const Candidate of candidates) {
      if (!Candidate) continue;
      try {
        if (typeof Candidate === "function") {
          // Try calling as a factory with common shapes first
          try {
            adapter = Candidate({ apiKey: key, model });
          } catch {
            // Maybe the factory expects model first like openaiText('gpt-5.2')
            try {
              adapter = Candidate(model);
            } catch {
              // Try constructing with new
              try {
                // @ts-expect-error
                adapter = new Candidate({ apiKey: key, model });
              } catch {
                // ignore
              }
            }
          }
        } else if (typeof Candidate === "object") {
          adapter = Candidate;
        }

        if (adapter) break;
      } catch (err) {
        // try next candidate
      }
    }

    if (adapter) {
      const stream = chat({ adapter, messages, conversationId });
      return toServerSentEventsResponse(stream);
    }
  } catch (err) {
    // fall through to HTTP fallback
  }

  // Fallback: use the existing helper that calls OpenRouter HTTP API (non-streaming)
  try {
    const helper = await import("../../../lib/openrouterServer");
    const result = await helper.default(messages as any, model);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const runtime = "edge";
