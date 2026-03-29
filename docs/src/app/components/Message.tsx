"use client";

import type { UIMessage } from "@tanstack/ai-react";
import { LoadingDots } from "./LoadingDots";

interface MessageProps {
  message: UIMessage;
  title: string;
  containerClass?: string;
  titleClass?: string;
  partTextClass?: string;
}

// TODO - add status code for proper error messaging, a 200 with no messages shouldn't throw error
export function Message({
  message,
  title,
  containerClass = "mb-4",
  titleClass = "font-semibold mb-1",
  partTextClass = "",
}: MessageProps) {
  console.log("got message", message);

  // Render parts and detect when an error-like payload is present.
  const renderedParts = message.parts.map((part, idx) => {
    if (part.type === "thinking") {
      return (
        <div
          key={idx}
          className={`flex items-center gap-2 text-sm text-gray-500 italic mb-2 ${partTextClass}`}
        >
          <LoadingDots className="text-gray-500" size={12} />
          <span className="sr-only">Assistant is typing</span>
          {part.content ? (
            <span className="text-xs text-gray-400">{part.content}</span>
          ) : null}
        </div>
      );
    }
    if (part.type === "text") {
      // If server returned a JSON error payload as text, try to parse it.
      const content = part.content as string | null | undefined;
      if (typeof content === "string") {
        const trimmed = content.trim();
        if (trimmed.startsWith("{") && trimmed.includes('"error"')) {
          try {
            const obj = JSON.parse(trimmed);
            if (obj && typeof obj.error === "string") {
              return (
                <div
                  key={idx}
                  className={`bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded px-2 py-1 ${partTextClass}`}
                >
                  <strong className="mr-1">Error:</strong> {obj.error}
                </div>
              );
            }
          } catch (e) {
            // fallthrough to render raw text
          }
        }

        // Detect common HTTP error text from the helper
        if (trimmed.includes("OpenRouter HTTP error")) {
          return (
            <div
              key={idx}
              className={`bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded px-2 py-1 ${partTextClass}`}
            >
              <strong className="mr-1">OpenRouter error:</strong> {trimmed}
            </div>
          );
        }
      }

      return (
        <div key={idx} className={partTextClass}>
          {part.content}
        </div>
      );
    }
    return null;
  });

  // If nothing meaningful rendered, show a helpful error hint so the user
  // isn't left with an empty Assistant bubble.
  const hasVisible = renderedParts.some((r) => r !== null);

  return (
    <div key={message.id} className={containerClass}>
      <div className={titleClass}>{title}</div>
      <div>
        {hasVisible ? (
          renderedParts
        ) : (
          <div
            className={`bg-red-50 dark:bg-red-900/80 text-red-800 dark:text-red-200 rounded px-2 py-1 ${partTextClass}`}
          >
            <strong className="mr-1">No response:</strong> The assistant did not
            return any content. This may indicate a 404 or server error from the
            OpenRouter proxy. Try selecting a different model or checking the
            OPENROUTER_API_KEY and server logs.
          </div>
        )}
      </div>
    </div>
  );
}
