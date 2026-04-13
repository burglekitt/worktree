import { getUnixNow } from "@burglekitt/gmt";
import { useCallback, useEffect } from "react";
import type { ChatMessage } from "../types";
import { useLocalStorage } from "./useLocalStorage";

function makeId(): string {
  return `${getUnixNow()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Strip messages that were mid-stream when the page last closed. */
function sanitizeLoaded(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => !(m.streaming && m.content === ""))
    .map((m) => (m.streaming ? { ...m, streaming: false } : m));
}

export interface MessageHistory {
  messages: ChatMessage[];
  /** Appends a user message and an empty assistant placeholder. Returns the placeholder's id. */
  addUserAndPlaceholder(userContent: string): string;
  /** Appends delta text to an in-progress assistant message. */
  appendDelta(id: string, delta: string): void;
  /** Marks an in-progress assistant message as failed (hard error). */
  failMessage(id: string, error: string): void;
  /** Marks an in-progress assistant message as a user-facing warning (recoverable). */
  warnMessage(id: string, warning: string): void;
  /** Clears the streaming flag on an assistant message once the stream ends. */
  finalizeMessage(id: string): void;
  clearAll(): void;
}

export function useMessageHistory(storageKey: string): MessageHistory {
  const { value: messages, setValue: setMessages } = useLocalStorage<
    ChatMessage[]
  >(storageKey, []);

  // Sanitize stale streaming flags left over from a previous session
  // (e.g. browser closed mid-stream). Runs once per storageKey so it never
  // strips the streaming flag from an actively-streaming placeholder.
  useEffect(() => {
    setMessages((prev) => {
      const hasStale = prev.some((m) => m.streaming);
      return hasStale ? sanitizeLoaded(prev) : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMessages]);

  const addUserAndPlaceholder = useCallback(
    (userContent: string): string => {
      const assistantId = makeId();

      const now = getUnixNow();
      setMessages((prev) => [
        ...sanitizeLoaded(prev),
        {
          id: makeId(),
          role: "user",
          content: userContent,
          createdAt: now as number,
        },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: now as number,
          streaming: true,
        },
      ]);
      return assistantId;
    },
    [setMessages],
  );

  const appendDelta = useCallback(
    (id: string, delta: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, content: m.content + delta } : m,
        ),
      );
    },
    [setMessages],
  );

  const failMessage = useCallback(
    (id: string, error: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: error, streaming: false, isError: true }
            : m,
        ),
      );
    },
    [setMessages],
  );

  const warnMessage = useCallback(
    (id: string, warning: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: warning, streaming: false, isWarning: true }
            : m,
        ),
      );
    },
    [setMessages],
  );

  const finalizeMessage = useCallback(
    (id: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, streaming: false } : m)),
      );
    },
    [setMessages],
  );

  const clearAll = useCallback(() => setMessages([]), [setMessages]);

  return {
    messages,
    addUserAndPlaceholder,
    appendDelta,
    failMessage,
    warnMessage,
    finalizeMessage,
    clearAll,
  };
}
