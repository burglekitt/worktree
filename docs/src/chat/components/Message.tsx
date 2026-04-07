"use client";

import type { ChatMessage } from "../types";
import { LoadingDots } from "./LoadingDots";

interface MessageProps {
  message: ChatMessage;
  title: string;
  containerClass?: string;
  titleClass?: string;
  contentClass?: string;
}

const ERROR_CLASS =
  "bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded px-2 py-1";

export function Message({
  message,
  title,
  containerClass = "mb-4",
  titleClass = "font-semibold mb-1",
  contentClass = "",
}: MessageProps) {
  const { content, streaming } = message;

  if (streaming && !content) {
    return (
      <div className={containerClass}>
        <div className={titleClass}>{title}</div>
        <div
          className={`flex items-center gap-2 text-sm italic text-gray-500 ${contentClass}`}
        >
          <LoadingDots className="text-gray-500" size={12} />
          <span className="sr-only">Assistant is typing</span>
        </div>
      </div>
    );
  }

  // Worker returned a JSON error payload
  const trimmed = content.trim();
  if (trimmed.startsWith("{") && trimmed.includes('"error"')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (
        parsed !== null &&
        typeof parsed === "object" &&
        "error" in parsed &&
        typeof (parsed as { error: unknown }).error === "string"
      ) {
        return (
          <div className={containerClass}>
            <div className={titleClass}>{title}</div>
            <div className={`${ERROR_CLASS} ${contentClass}`}>
              <strong className="mr-1">Error:</strong>
              {(parsed as { error: string }).error}
            </div>
          </div>
        );
      }
    } catch {
      // Not valid JSON — fall through to plain text
    }
  }

  return (
    <div className={containerClass}>
      <div className={titleClass}>{title}</div>
      <div className={contentClass}>{content}</div>
    </div>
  );
}
