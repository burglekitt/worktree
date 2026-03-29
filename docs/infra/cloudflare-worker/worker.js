/*
Cloudflare Worker: OpenRouter proxy

Security notes:
- Store your OpenRouter API key in the worker environment variable
  `OPENROUTER_API_KEY` (set via wrangler secret or Cloudflare dashboard).
- Keep the allowed model list small to avoid abuse.

This worker accepts POST requests with JSON body: { messages: [...], model?: string }
and forwards to OpenRouter's HTTP chat endpoint, returning the proxied status and body.
*/
import { ALLOWED_MODELS } from "../../src/app/components/constants";

async function handleRequest(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, model } = body || {};
  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "messages must be an array" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const chosenModel =
    model ||
    new URL(request.url).searchParams.get("model") ||
    ALLOWED_MODELS[0]?.value;
  if (!ALLOWED_MODELS.includes(chosenModel)) {
    return new Response(
      JSON.stringify({ error: `Model not allowed: ${chosenModel}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const key = OPENROUTER_API_KEY || process.env?.OPENROUTER_API_KEY;
  if (!key) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const res = await fetch("https://api.openrouter.ai/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model: chosenModel, messages, stream: false }),
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    // Proxy status and JSON body when possible
    if (!res.ok) {
      if (contentType.includes("application/json")) {
        return new Response(text, {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: text }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (contentType.includes("application/json")) {
      return new Response(text, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
