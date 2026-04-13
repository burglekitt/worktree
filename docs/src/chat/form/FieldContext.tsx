import { createContext, useContext } from "react";

// biome-ignore lint/suspicious/noExplicitAny: generic context holds any TanStack field instance
export const FieldContext = createContext<any | null>(null);

export function useField() {
  const f = useContext(FieldContext);
  if (!f) throw new Error("useField must be used inside a FormField");
  return f;
}
