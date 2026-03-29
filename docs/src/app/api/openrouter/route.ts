import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { openRouterText } from "@tanstack/ai-openrouter";
import { ALLOWED_MODELS } from "../../components/constants";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get("model") || ALLOWED_MODELS[0];

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages, conversationId } = await request.json();

  try {
    const stream = chat({
      adapter: openRouterText(model, {
        apiKey: key,
      }),
      messages,
      conversationId,
      systemPrompts: [
        "You are a helpful assistant for our docs. Only answer questions about our codebase.",
      ],
    });
    return toServerSentEventsResponse(stream);
  } catch (error) {
    console.error("OpenRouter error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const runtime = "edge";
