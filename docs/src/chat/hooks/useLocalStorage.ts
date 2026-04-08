"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function readItem<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

function writeItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private-browsing restriction — ignore
  }
}

function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Drop-in replacement for useState that persists the value in localStorage.
 * SSR-safe: reads localStorage only on the client.
 * Cross-tab: listens to the "storage" event to stay in sync.
 *
 * Key changes are handled synchronously during render (React getDerivedStateFromProps
 * pattern) so there is no one-frame flash of stale data when the key changes.
 */
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  removeItem: () => void;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturn<T> {
  // Stable ref so initialValue never needs to be in dep arrays.
  const initialValueRef = useRef(initialValue);

  // Bundle the key into state so we can detect key changes synchronously.
  const [state, setStateRaw] = useState<{ key: string; value: T }>(() => ({
    key,
    value: readItem(key, initialValueRef.current),
  }));

  // If the key changed since the last render, derive the correct value now
  // (before paint). React re-renders synchronously one more time with the
  // correct value, avoiding any flash of stale data.
  let value = state.value;
  if (state.key !== key) {
    value = readItem(key, initialValueRef.current);
    setStateRaw({ key, value });
  }

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (action) => {
      setStateRaw((prev) => {
        // If the key shifted between renders, read fresh before applying the action.
        const base =
          prev.key === key
            ? prev.value
            : readItem(key, initialValueRef.current);
        const next =
          typeof action === "function"
            ? (action as (prev: T) => T)(base)
            : action;
        writeItem(key, next);
        return { key, value: next };
      });
    },
    [key],
  );

  // Stay in sync across tabs / other useLocalStorage instances on the same key.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage || e.key !== key) return;
      if (e.newValue === null) {
        setStateRaw({ key, value: initialValueRef.current });
      } else {
        try {
          setStateRaw({ key, value: JSON.parse(e.newValue) as T });
        } catch {
          // ignore malformed values from other tabs
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const remove = useCallback(() => {
    removeItem(key);
    setStateRaw({ key, value: initialValueRef.current });
  }, [key]);

  return { value, setValue, removeItem: remove };
}

export { removeItem as removeLocalStorageItem };
