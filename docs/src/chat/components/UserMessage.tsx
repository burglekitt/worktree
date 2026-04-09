"use client";

import { useId } from "react";
import type { ChatMessage } from "../types";
import { MessageMeta } from "./MessageMeta";

type UserMessageProps = {
  message: ChatMessage;
};

export function UserMessage({ message }: UserMessageProps) {
  const { content, createdAt } = message;
  const titleId = useId();

  return (
    <article
      aria-labelledby={titleId}
      className="mb-4 text-gray-800 dark:text-gray-100"
    >
      <MessageMeta titleId={titleId} title="You" createdAt={createdAt} />
      <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg px-3 py-2">
        {content}
      </div>
    </article>
  );
}
