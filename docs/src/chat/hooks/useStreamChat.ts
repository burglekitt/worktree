"use client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { parseGeminiSseLine } from "../../utils/parseGeminiSseLine";
import { useMessageHistory } from "./useMessageHistory";

const REQUEST_TIMEOUT_MS = 120_000;
const STREAM_IDLE_TIMEOUT_MS = 30_000;

export interface UseStreamChatReturn {
  messages: ReturnType<typeof useMessageHistory>["messages"];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

interface MutationVars {
  text: string;
  historySnapshot: Array<{ role: string; content: string }>;
  assistantId: string;
}

export function useStreamChat(model: string): UseStreamChatReturn {
  const history = useMessageHistory(`docs_chat_history_${model}`);
  const abortRef = useRef<AbortController | null>(null);
  // Stable ref so sendMessage always reads the latest messages without
  // needing to list `history.messages` as a useCallback dependency (which
  // would re-create sendMessage on every streaming delta).
  const messagesRef = useRef(history.messages);
  messagesRef.current = history.messages;

  const base = process.env.GEMINI_WORKER_URL || "http://localhost:8787";

  const mutation = useMutation({
    mutationFn: async ({
      text,
      historySnapshot,
      assistantId,
    }: MutationVars) => {
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      let didTimeout = false;
      const requestTimeout = setTimeout(() => {
        didTimeout = true;
        abort.abort();
      }, REQUEST_TIMEOUT_MS);

      const readWithTimeout = async (
        reader: ReadableStreamDefaultReader<Uint8Array>,
      ) => {
        // Promise.race reader.read() against a timeout to detect stalled streams. We still
        // rely on the server to send a final "done" message and close the stream, but this
        return await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              didTimeout = true;
              reject(new Error("Stream timeout"));
            }, STREAM_IDLE_TIMEOUT_MS);
          }),
        ]);
      };

      try {
        const res = await fetch(base, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
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
          history.warnMessage(assistantId, errMsg);
          return;
        }

        if (!res.body) {
          history.failMessage(assistantId, "Error: empty response body");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let textChunks = 0;

        outer: while (true) {
          const { done, value } = await readWithTimeout(reader);
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            const delta = parseGeminiSseLine(line);
            switch (delta.type) {
              case "text":
                textChunks++;
                history.appendDelta(assistantId, delta.text);
                break;
              case "error":
                console.error("[chat] SSE error:", delta.message);
                history.warnMessage(assistantId, delta.message);
                return;
              case "done":
                break outer;
              // "skip": do nothing
            }
          }
        }

        if (textChunks === 0) {
          console.warn(
            "[chat] stream completed with zero text chunks — check worker URL and model",
          );
        }
      } catch (err) {
        if (didTimeout) {
          history.warnMessage(
            assistantId,
            "Request timed out while waiting for model output. Please retry or switch model.",
          );
        } else if ((err as { name?: string }).name !== "AbortError") {
          history.failMessage(assistantId, "Connection error");
        }
      } finally {
        clearTimeout(requestTimeout);
        history.finalizeMessage(assistantId);
      }
    },
  });

  const { isPending, mutateAsync, reset } = mutation;

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isPending) return;
      const trimmed = text.trim();
      const historySnapshot = messagesRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      // Optimistically append the user message + assistant placeholder so the
      // loading state appears immediately, even before network round-trip.
      const assistantId = history.addUserAndPlaceholder(trimmed);
      await mutateAsync({ text: trimmed, historySnapshot, assistantId });
    },
    [history, isPending, mutateAsync],
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
