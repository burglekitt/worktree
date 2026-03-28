"use client";

import { AssistantMessage } from "./AssistantMessage";
import type { ChatMessage } from "./types";
import { UserMessage } from "./UserMessage";

type MessagesProps = {
  messages: ChatMessage[];
};

export function Messages({ messages }: MessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) =>
        message.role === "assistant" ? (
          <AssistantMessage key={message.id} message={message} />
        ) : (
          <UserMessage key={message.id} message={message} />
        ),
      )}
    </div>
  );
}
