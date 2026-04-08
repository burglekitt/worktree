"use client";

import type { ChatMessage } from "../types";
import { MarkdownContent } from "./MarkdownContent";
import { Message } from "./Message";

interface AssistantMessageProps {
  message: ChatMessage;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  return (
    <Message
      message={message}
      title="Assistant"
      containerClass="mb-4"
      titleClass="font-semibold text-blue-600 dark:text-blue-400"
      contentClass="bg-blue-50 dark:bg-blue-950/60 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2"
      renderContent={(content) => <MarkdownContent content={content} />}
    />
  );
}
