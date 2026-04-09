import { useEffect, useEffectEvent } from "react";

interface UseGlobalKeyDownProps {
  key: string;
  ctrlOrMeta: boolean;
  callback: () => void;
}

export function useGlobalKeyDown({
  key,
  ctrlOrMeta,
  callback,
}: UseGlobalKeyDownProps) {
  // useEffectEvent captures the latest key/ctrlOrMeta/callback on every
  // render without requiring them as useEffect deps. The listener is only
  // attached once (no unnecessary remove/re-add on every render).
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (
      (ctrlOrMeta ? e.ctrlKey || e.metaKey : true) &&
      e.key.toLowerCase() === key.toLowerCase()
    ) {
      e.preventDefault();
      callback();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // stable — onKey always reads latest values via useEffectEvent
}
