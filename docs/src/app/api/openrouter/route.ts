import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { openRouterText } from "@tanstack/ai-openrouter";

export async function POST(request: Request) {
  // get model from ?model= query param, default to gpt-5.2
  const { searchParams } = new URL(request.url);
  const model = searchParams.get("model") || "gpt-5.2";

  if (!process.env.WORKTREE_OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "OPENAI_API_KEY not configured",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const {
    messages,
    data: { conversationId },
  } = await request.json();

  try {
    // Create a streaming chat response
    // get model passed in as rg and chose

    const stream = chat({
      adapter: openRouterText(model as string as any),
      messages,
      conversationId,
    });

    // Convert stream to HTTP response
    return toServerSentEventsResponse(stream);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
