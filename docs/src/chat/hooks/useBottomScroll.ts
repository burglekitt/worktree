import { type RefObject, useLayoutEffect } from "react";
import type { ChatMessage } from "../types";

interface UseBottomScrollProps {
  containerRef: RefObject<HTMLElement | null>;
  endRef: RefObject<HTMLElement | null>;
  lastSnapshotRef: RefObject<string | undefined>;
  lastMsg?: ChatMessage;
  showPendingAssistant: boolean;
}

export function useBottomScroll({
  containerRef,
  endRef,
  lastSnapshotRef,
  lastMsg,
  showPendingAssistant,
}: UseBottomScrollProps) {
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const snapshot = lastMsg
      ? `${lastMsg.id}:${lastMsg.content.length}:${String(lastMsg.streaming)}:${String(
          showPendingAssistant,
        )}`
      : String(showPendingAssistant);

    if (lastSnapshotRef.current === snapshot) return;
    lastSnapshotRef.current = snapshot;

    const threshold = 120;
    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    // If we're showing the optimistic pending assistant (thinking dots),
    // always scroll so the user sees the placeholder immediately.
    if (showPendingAssistant) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      return;
    }

    // If the last message is a finished assistant reply, jump to it.
    if (lastMsg?.role === "assistant" && !lastMsg.streaming) {
      endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      return;
    }

    if (isAtBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });
}
