"use client";

import { useRef } from "react";
import { useBottomScroll } from "../hooks/useBottomScroll";
import type { ChatMessage } from "../types";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";

interface MessagesProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
}
// isThinking? need this bool between after send and waiting for message

export function Messages({ messages, isStreaming = false }: MessagesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const lastSnapshotRef = useRef<string | undefined>(undefined);
  const hasStreamingAssistant = messages.some(
    (m) => m.role === "assistant" && m.streaming,
  );
  const showPendingAssistant = isStreaming && !hasStreamingAssistant;

  // Separate the actively-streaming message from settled history so the
  // scroll logic always uses the live value.
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
    showPendingAssistant,
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
      {showPendingAssistant ? (
        <AssistantMessage
          message={{
            id: "pending-assistant",
            role: "assistant",
            content: "",
            createdAt: Date.now(),
            streaming: true,
          }}
        />
      ) : null}
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
