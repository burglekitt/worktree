type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function chatWithOpenRouter(
  messages: ChatMessage[],
  model: string = "openai/gpt-5.2"
) {
  // First try to use the TanStack AI OpenRouter adapter if installed.
  try {
    // dynamic import so runtime doesn't fail if package missing
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import("@tanstack/ai-openrouter");
    const key = process.env.WORKTREE_OPENROUTER_API_KEY;
    if (mod && key) {
      // Try known export shapes
      const Candidates = [
        mod.OpenRouter,
        mod.default,
        mod.OpenRouterAdapter,
        mod.OpenRouterClient,
      ];
      for (const Candidate of Candidates) {
        if (!Candidate) continue;
        try {
          // some adapters are functions, some are classes
          // @ts-expect-error
          const client =
            typeof Candidate === "function"
              ? new Candidate({ apiKey: key })
              : Candidate;
          // candidate may also be a factory: try calling
          // @ts-expect-error
          if (!client?.chat && typeof Candidate === "function") {
            // try calling as factory
            // @ts-expect-error
            const maybe = Candidate({ apiKey: key });
            if (maybe?.chat) {
              // @ts-expect-error
              return await maybe.chat.send({
                model,
                messages,
                stream: false,
              });
            }
          }

          if (client?.chat?.send) {
            // @ts-expect-error
            return await client.chat.send({
              model,
              messages,
              stream: false,
            });
          }
        } catch (err) {
          // try next candidate
        }
      }
    }
  } catch (err) {
    // ignore and fall back to fetch
  }

  // Fallback: call OpenRouter HTTP API directly
  const key = process.env.WORKTREE_OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing WORKTREE_OPENROUTER_API_KEY");

  const res = await fetch("https://api.openrouter.ai/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter HTTP error: ${res.status} ${text}`);
  }

  return res.json();
}

export default chatWithOpenRouter;
