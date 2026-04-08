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
      containerClass="mb-4 text-gray-800 dark:text-gray-100"
      titleClass="font-semibold"
      contentClass="bg-gray-100 dark:bg-neutral-800 rounded-lg px-3 py-2"
    />
  );
}
