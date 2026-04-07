import { useCallback, useState } from "react";
import type { ChatMessage } from "../types";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface MessageHistory {
  messages: ChatMessage[];
  /** Appends a user message and an empty assistant placeholder. Returns the placeholder's id. */
  addUserAndPlaceholder(userContent: string): string;
  /** Appends delta text to an in-progress assistant message. */
  appendDelta(id: string, delta: string): void;
  /** Marks an in-progress assistant message as failed. */
  failMessage(id: string, error: string): void;
  /** Clears the streaming flag on an assistant message once the stream ends. */
  finalizeMessage(id: string): void;
  clearAll(): void;
}

export function useMessageHistory(): MessageHistory {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addUserAndPlaceholder = useCallback((userContent: string): string => {
    const assistantId = makeId();
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: "user", content: userContent },
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ]);
    return assistantId;
  }, []);

  const appendDelta = useCallback((id: string, delta: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + delta } : m)),
    );
  }, []);

  const failMessage = useCallback((id: string, error: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content: error, streaming: false } : m,
      ),
    );
  }, []);

  const finalizeMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, streaming: false } : m)),
    );
  }, []);

  const clearAll = useCallback(() => setMessages([]), []);

  return {
    messages,
    addUserAndPlaceholder,
    appendDelta,
    failMessage,
    finalizeMessage,
    clearAll,
  };
}
