"use server";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export default async function sendMessage(
  messages: ChatMessage[],
  model?: string,
) {
  if (!Array.isArray(messages)) {
    throw new Error("messages must be an array");
  }

  const key = process.env.WORKTREE_OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing WORKTREE_OPENROUTER_API_KEY");

  const res = await fetch("https://api.openrouter.ai/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: model ?? "openai/gpt-5.2",
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter HTTP error: ${res.status} ${text}`);
  }

  return res.json();
}
