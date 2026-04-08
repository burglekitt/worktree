"use client";

import type React from "react";
import type { ChatMessage } from "../types";
import { LoadingDots } from "./LoadingDots";

interface MessageProps {
  message: ChatMessage;
  title: string;
  containerClass?: string;
  titleClass?: string;
  contentClass?: string;
  renderContent?: (content: string) => React.ReactNode;
}

const BUBBLE_BASE_CLASS =
  "rounded-lg px-3 py-2 transition-[background-color,color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

const ASSISTANT_CLASS =
  "bg-blue-50 dark:bg-blue-950/60 text-gray-800 dark:text-gray-100";

const WARNING_CLASS =
  "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200";

const ERROR_CLASS =
  "bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200";

export function Message({
  message,
  title,
  containerClass = "mb-4",
  titleClass = "font-semibold",
  contentClass = "",
  renderContent,
}: MessageProps) {
  const { content, streaming, createdAt, isError, isWarning } = message;
  const formattedTime = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const header = (
    <div className="flex items-baseline justify-between mb-1">
      <div className={titleClass}>{title}</div>
      <time className="text-xs text-gray-400 dark:text-gray-500 ml-2">
        {formattedTime}
      </time>
    </div>
  );

  const stateClass = isError
    ? ERROR_CLASS
    : isWarning
      ? WARNING_CLASS
      : ASSISTANT_CLASS;
  const bubbleClass = `${BUBBLE_BASE_CLASS} ${stateClass} ${contentClass}`;

  return (
    <div className={containerClass}>
      {header}
      <div className={bubbleClass}>
        {streaming && !content ? (
          <div className="flex items-center gap-2 text-sm italic">
            <LoadingDots className="text-current h-6" size={12} />
            <span className="sr-only">Assistant is typing</span>
          </div>
        ) : renderContent ? (
          renderContent(content)
        ) : (
          content
        )}
      </div>
    </div>
  );
}
