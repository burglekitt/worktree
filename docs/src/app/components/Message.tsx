"use client";

import type { UIMessage } from "@tanstack/ai-react";

interface MessageProps {
  message: UIMessage;
  title: string;
  containerClass?: string;
  titleClass?: string;
  partTextClass?: string;
}

export function Message({
  message,
  title,
  containerClass = "mb-4",
  titleClass = "font-semibold mb-1",
  partTextClass = "",
}: MessageProps) {
  return (
    <div key={message.id} className={containerClass}>
      <div className={titleClass}>{title}</div>
      <div>
        {message.parts.map((part, idx) => {
          if (part.type === "thinking") {
            return (
              <div
                key={idx}
                className={`text-sm text-gray-500 italic mb-2 ${partTextClass}`}
              >
                💭 Thinking: {part.content}
              </div>
            );
          }
          if (part.type === "text") {
            return (
              <div key={idx} className={partTextClass}>
                {part.content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
