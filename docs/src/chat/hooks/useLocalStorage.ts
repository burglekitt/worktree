"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

// ─── Storage helpers ──────────────────────────────────────────────────────────

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
    // The native "storage" event only fires in OTHER tabs/windows.
    // Dispatch manually so same-tab subscribers react too.
    window.dispatchEvent(
      new StorageEvent("storage", { key, storageArea: window.localStorage }),
    );
  } catch {
    // Quota exceeded or private-browsing restriction — ignore
  }
}

function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(
      new StorageEvent("storage", { key, storageArea: window.localStorage }),
    );
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  removeItem: () => void;
}

/**
 * Drop-in replacement for useState that persists the value in localStorage.
 * SSR-safe: returns initialValue on the server / during hydration.
 * Same-tab sync: writeItem/removeItem dispatch StorageEvent manually.
 * Cross-tab sync: native "storage" event from other tabs is handled.
 * Concurrent-safe: useSyncExternalStore ensures consistent snapshots.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturn<T> {
  // Stable ref so initialValue never causes getSnapshot / getServerSnapshot
  // to change identity on every render (avoids needless re-subscription).
  const initialValueRef = useRef(initialValue);

  // Cache the last raw→parsed pair so getSnapshot returns the same object
  // reference when the underlying string hasn't changed.
  // useSyncExternalStore uses Object.is: a new reference on every call
  // (e.g. from JSON.parse) causes an infinite render loop.
  const snapshotCacheRef = useRef<{
    key: string;
    raw: string | null;
    value: T;
  } | null>(null);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.storageArea !== window.localStorage) return;
        // null key = localStorage.clear() — affects every key
        if (e.key === null || e.key === key) onStoreChange();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return initialValueRef.current;
    const raw = window.localStorage.getItem(key);
    const cache = snapshotCacheRef.current;
    if (cache && cache.key === key && cache.raw === raw) return cache.value;
    let parsed: T;
    try {
      parsed = raw !== null ? (JSON.parse(raw) as T) : initialValueRef.current;
    } catch {
      parsed = initialValueRef.current;
    }
    snapshotCacheRef.current = { key, raw, value: parsed };
    return parsed;
  }, [key]);

  const getServerSnapshot = useCallback(
    () => initialValueRef.current,
    [], // never changes
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (action) => {
      const current = readItem<T>(key, initialValueRef.current);
      const next =
        typeof action === "function"
          ? (action as (prev: T) => T)(current)
          : action;
      writeItem(key, next);
    },
    [key],
  );

  const remove = useCallback(() => removeItem(key), [key]);

  return { value, setValue, removeItem: remove };
}

export { removeItem as removeLocalStorageItem };
