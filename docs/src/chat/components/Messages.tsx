"use client";

import { useLayoutEffect, useRef } from "react";
import { AssistantMessage } from "../../app/components/AssistantMessage";
import type { ChatMessage } from "../types";
import { UserMessage } from "./UserMessage";

interface MessagesProps {
  messages: ChatMessage[];
}

export function Messages({ messages }: MessagesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const lastSnapshotRef = useRef<string | undefined>(undefined);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const lastMsg = messages.length ? messages[messages.length - 1] : undefined;
    const snapshot = lastMsg
      ? `${lastMsg.id}:${lastMsg.content.length}:${String(lastMsg.streaming)}`
      : undefined;

    if (lastSnapshotRef.current === snapshot) return;
    lastSnapshotRef.current = snapshot;

    const threshold = 120;
    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    if (lastMsg?.role === "assistant" && !lastMsg.streaming) {
      endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
    if (isAtBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
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
