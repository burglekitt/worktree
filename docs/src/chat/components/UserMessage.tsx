"use client";

import type { ChatMessage } from "../types";
import { Message } from "./Message";

type UserMessageProps = {
  message: ChatMessage;
};

export function UserMessage({ message }: UserMessageProps) {
  return (
    <Message
      message={message}
      title="You"
      containerClass="mb-4 text-gray-800 dark:text-gray-200"
      titleClass="font-semibold mb-1"
      contentClass="bg-gray-200 dark:bg-gray-700 rounded-lg px-2 py-1"
    />
  );
}
