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
      renderContent={(content) => <MarkdownContent content={content} />}
    />
  );
}
