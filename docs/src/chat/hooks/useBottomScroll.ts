import { type RefObject, useLayoutEffect } from "react";
import type { ChatMessage } from "../types";

interface UseBottomScrollProps {
  containerRef: RefObject<HTMLElement | null>;
  endRef: RefObject<HTMLElement | null>;
  lastSnapshotRef: RefObject<string | undefined>;
  lastMsg?: ChatMessage;
}

export function useBottomScroll({
  containerRef,
  endRef,
  lastSnapshotRef,
  lastMsg,
}: UseBottomScrollProps) {
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const snapshot = lastMsg
      ? `${lastMsg.id}:${lastMsg.content.length}:${String(lastMsg.streaming)}`
      : "empty";

    if (lastSnapshotRef.current === snapshot) return;
    lastSnapshotRef.current = snapshot;

    const threshold = 120;
    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    // Placeholder just appeared (streaming, no content yet) — always scroll
    // so the user sees the loading dots immediately after submitting.
    if (lastMsg?.streaming && !lastMsg.content) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      return;
    }

    // Finished assistant reply — jump to it unconditionally.
    if (lastMsg?.role === "assistant" && !lastMsg.streaming) {
      endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      return;
    }

    if (isAtBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });
}
