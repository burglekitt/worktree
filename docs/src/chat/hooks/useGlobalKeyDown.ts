import { useEffect } from "react";

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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (ctrlOrMeta ? e.ctrlKey || e.metaKey : true) &&
        e.key.toLowerCase() === key.toLowerCase()
      ) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, ctrlOrMeta, callback]);
}
