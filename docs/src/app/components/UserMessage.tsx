"use client";

import type { UIMessage } from "@tanstack/ai-react";
import { Message } from "./Message";

type UserMessageProps = {
  message: UIMessage;
};

export function UserMessage({ message }: UserMessageProps) {
  return (
    <Message
      message={message}
      title="You"
      containerClass="mb-4 text-gray-800 dark:text-gray-200"
      titleClass="font-semibold mb-1"
      partTextClass="bg-gray-200 dark:bg-gray-700 rounded-lg px-2 py-1"
    />
  );
}
