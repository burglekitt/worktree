"use client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { parseGeminiSseLine } from "../../utils/parseGeminiSseLine";
import { useMessageHistory } from "./useMessageHistory";

export interface UseStreamChatReturn {
  messages: ReturnType<typeof useMessageHistory>["messages"];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

interface MutationVars {
  text: string;
  historySnapshot: Array<{ role: string; content: string }>;
}

export function useStreamChat(model: string): UseStreamChatReturn {
  const history = useMessageHistory();
  const abortRef = useRef<AbortController | null>(null);
  // Stable ref so sendMessage always reads the latest messages without
  // needing to list `history.messages` as a useCallback dependency (which
  // would re-create sendMessage on every streaming delta).
  const messagesRef = useRef(history.messages);
  messagesRef.current = history.messages;

  console.log("GOT GEM_WORKER_URL", process.env.GEMINI_WORKER_URL);
  const base = process.env.GEMINI_WORKER_URL || "http://localhost:8787";

  const mutation = useMutation({
    mutationFn: async ({ text, historySnapshot }: MutationVars) => {
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const assistantId = history.addUserAndPlaceholder(text);
      const workerUrl = `${base}?model=${encodeURIComponent(model)}`;

      try {
        const res = await fetch(workerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...historySnapshot, { role: "user", content: text }],
          }),
          signal: abort.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          let errMsg = `Error ${res.status}`;
          try {
            const parsed = JSON.parse(errText) as { error?: string };
            if (parsed.error) errMsg = parsed.error;
          } catch {
            // plain-text error body
          }
          history.failMessage(assistantId, errMsg);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buf = "";

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            const delta = parseGeminiSseLine(line);
            switch (delta.type) {
              case "text":
                history.appendDelta(assistantId, delta.text);
                break;
              case "error":
                history.failMessage(assistantId, delta.message);
                return;
              case "done":
                break outer;
              // "skip": do nothing
            }
          }
        }
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          history.failMessage(assistantId, "Connection error");
        }
      } finally {
        history.finalizeMessage(assistantId);
      }
    },
  });

  const { isPending, mutateAsync, reset } = mutation;

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isPending) return;
      const historySnapshot = messagesRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      await mutateAsync({ text, historySnapshot });
    },
    [isPending, mutateAsync],
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    reset();
    history.clearAll();
  }, [reset, history.clearAll]);

  return {
    messages: history.messages,
    isStreaming: isPending,
    sendMessage,
    clearMessages,
  };
}
