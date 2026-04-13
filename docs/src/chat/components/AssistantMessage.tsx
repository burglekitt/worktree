"use client";

import { useId } from "react";
import type { ChatMessage } from "../types";
import { LoadingDots } from "./LoadingDots";
import { MarkdownContent } from "./MarkdownContent";
import { MessageMeta } from "./MessageMeta";

const BUBBLE_BASE =
  "rounded-lg px-3 py-2 transition-[background-color,color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";
const DEFAULT_CLASS =
  "bg-blue-50 dark:bg-blue-950/60 text-gray-800 dark:text-gray-100";
const WARNING_CLASS =
  "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200";
const ERROR_CLASS =
  "bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200";

interface AssistantMessageProps {
  message: ChatMessage;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const { content, streaming, createdAt, isError, isWarning } = message;
  const titleId = useId();

  const stateClass = isError
    ? ERROR_CLASS
    : isWarning
      ? WARNING_CLASS
      : DEFAULT_CLASS;

  return (
    <article aria-labelledby={titleId} className="mb-4">
      <MessageMeta
        titleId={titleId}
        title="Assistant"
        titleClass="font-semibold text-blue-600 dark:text-blue-400"
        createdAt={createdAt}
      />
      <div
        className={`${BUBBLE_BASE} ${stateClass}`}
        aria-live="polite"
        aria-atomic="false"
      >
        {streaming && !content ? (
          <div className="flex items-center gap-2 text-sm italic">
            <LoadingDots className="text-current h-6" size={12} />
            <span className="sr-only">Assistant is typing</span>
          </div>
        ) : (
          <MarkdownContent content={content} />
        )}
      </div>
    </article>
  );
}
