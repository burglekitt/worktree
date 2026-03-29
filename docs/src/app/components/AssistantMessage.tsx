"use client";

import type { UIMessage } from "@tanstack/ai-react";
import { Message } from "./Message";

interface AssistantMessageProps {
  message: UIMessage;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  return (
    <Message
      message={message}
      title="Assistant"
      containerClass="mb-4 bg-blue-200 dark:bg-blue-300 text-gray-700 dark:text-gray-900 rounded-lg px-2 py-1"
      titleClass="font-semibold"
      partTextClass=""
    />
  );
}
