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

const ERROR_CLASS =
  "bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded px-2 py-1";

const WARNING_CLASS =
  "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded px-2 py-1";

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

  if (streaming && !content) {
    return (
      <div className={containerClass}>
        {header}
        <div
          className={`flex items-center gap-2 text-sm italic text-gray-500 ${contentClass}`}
        >
          <LoadingDots className="text-gray-500 h-6" size={12} />
          <span className="sr-only">Assistant is typing</span>
        </div>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div className={containerClass}>
        {header}
        <div className={WARNING_CLASS}>{content}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={containerClass}>
        {header}
        <div className={ERROR_CLASS}>{content}</div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {header}
      <div className={contentClass}>
        {renderContent ? renderContent(content) : content}
      </div>
    </div>
  );
}
