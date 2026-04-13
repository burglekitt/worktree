"use client";

import { useRef } from "react";
import { useBottomScroll } from "../hooks/useBottomScroll";
import type { ChatMessage } from "../types";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";

interface MessagesProps {
  messages: ChatMessage[];
}

export function Messages({ messages }: MessagesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const lastSnapshotRef = useRef<string | undefined>(undefined);

  // Separate the actively-streaming message (placeholder or in-flight content)
  // from settled history so the scroll logic always uses the live value.
  const lastMsg = messages.length ? messages[messages.length - 1] : undefined;
  const activeStreamingMsg = lastMsg?.streaming ? lastMsg : undefined;
  const historicalMessages = activeStreamingMsg
    ? messages.slice(0, -1)
    : messages;

  useBottomScroll({
    containerRef,
    endRef,
    lastSnapshotRef,
    lastMsg,
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 scroll-smooth"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {historicalMessages.map((message) =>
        message.role === "assistant" ? (
          <AssistantMessage key={message.id} message={message} />
        ) : (
          <UserMessage key={message.id} message={message} />
        ),
      )}
      {activeStreamingMsg && (
        <AssistantMessage
          key={activeStreamingMsg.id}
          message={activeStreamingMsg}
        />
      )}
      <div ref={endRef} />
    </div>
  );
}
