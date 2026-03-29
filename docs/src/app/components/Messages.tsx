"use client";

import type { UIMessage } from "@tanstack/ai-react";
import { useLayoutEffect, useRef } from "react";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";

interface MessagesProps {
  messages: UIMessage[];
}

export function Messages({ messages }: MessagesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const lastSnapshotRef = useRef<string | undefined>(undefined);

  // Keep the scroll anchored to bottom when new messages arrive.
  // We only act when the last message changes (id or parts). If the last
  // assistant message has finished streaming (no "thinking" part), force
  // scroll to the very bottom so users always see the completed response.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const lastMsg = messages.length ? messages[messages.length - 1] : undefined;
    const snapshot = lastMsg
      ? `${lastMsg.id}:${lastMsg.parts
          .map(
            (p) =>
              `${p.type}:${"content" in p ? String((p as unknown as Record<string, unknown>)["content"]) : ""}`,
          )
          .join("|")}`
      : undefined;

    // Bail early if nothing relevant changed.
    if (lastSnapshotRef.current === snapshot) return;
    lastSnapshotRef.current = snapshot;

    const threshold = 120; // px from bottom that counts as "at bottom"
    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    if (
      lastMsg &&
      lastMsg.role === "assistant" &&
      !lastMsg.parts.some((p) => p.type === "thinking")
    ) {
      // Assistant finished: ensure we jump to the very bottom to show final reply
      endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
    if (isAtBottom) {
      // If the user is already near the bottom, smooth-scroll for new content
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    // If the user has scrolled up, do not steal their scroll position except
    // when the assistant finishes (above) which always forces to bottom.
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 scroll-smooth"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {messages.map((message) =>
        message.role === "assistant" ? (
          <AssistantMessage key={message.id} message={message} />
        ) : (
          <UserMessage key={message.id} message={message} />
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}
