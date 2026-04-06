"use client";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { ChatForm } from "./ChatForm";
import { FREE_MODELS } from "./constants";
import { Messages } from "./Messages";

interface ChatPanelProps {
  model?: string;
}

export function ChatPanel({ model = FREE_MODELS[0].value }: ChatPanelProps) {
  // Worker URL (set NEXT_PUBLIC_GEMINI_WORKER_URL for production), fallback to local wrangler dev
  const base =
    process.env.NEXT_PUBLIC_GEMINI_WORKER_URL || "http://localhost:8787";
  const connectionUrl = `${base}/chat${model ? `?model=${encodeURIComponent(model)}` : ""}`;

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents(connectionUrl),
  });

  async function handleSubmit(message: string) {
    if (!message.trim() || isLoading) return;
    await sendMessage(message);
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="flex flex-col h-full max-h-[90vh] border rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
        <Messages messages={messages} />
        <ChatForm onSubmit={handleSubmit} disabled={isLoading} />
      </div>
    </div>
  );
}
