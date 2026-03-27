"use client";
import { Button, Input } from "@base-ui/react";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { useState } from "react";

type Props = {
  model?: string;
};

export function ChatPanel({ model = "openai/gpt-5.2" }: Props) {
  const [input, setInput] = useState("");

  const connectionUrl = `/api/openrouter${
    model ? `?model=${encodeURIComponent(model)}` : ""
  }`;

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents(connectionUrl),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (input.trim() && !isLoading) {
      await sendMessage(input);
      setInput("");
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === "assistant" ? "text-blue-600" : "text-gray-800"
            }`}
          >
            <div className="font-semibold mb-1">
              {message.role === "assistant" ? "Assistant" : "You"}
            </div>
            <div>
              {message.parts.map((part, idx) => {
                if (part.type === "thinking") {
                  return (
                    <div
                      key={idx}
                      className="text-sm text-gray-500 italic mb-2"
                    >
                      💭 Thinking: {part.content}
                    </div>
                  );
                }
                if (part.type === "text") {
                  return <div key={idx}>{part.content}</div>;
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
