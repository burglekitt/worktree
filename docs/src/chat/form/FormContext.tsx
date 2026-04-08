"use client";

import { useStore } from "@tanstack/react-store";
import type React from "react";
import { createContext, useContext } from "react";

// biome-ignore lint/suspicious/noExplicitAny: generic context holds any TanStack form instance
const FormContext = createContext<any | null>(null);

export function FormProvider({
  form,
  children,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: accepts any TanStack form instance
  form: any;
  children: React.ReactNode;
}) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

export function useFormContext() {
  const f = useContext(FormContext);
  if (!f) throw new Error("useFormContext must be used inside a FormProvider");
  return f;
}

// biome-ignore lint/suspicious/noExplicitAny: store state shape depends on form data shape unknown here
export function useFormStore<T>(selector: (s: any) => T) {
  const form = useFormContext();
  // biome-ignore lint/suspicious/noExplicitAny: selector cast required for generic store access
  return useStore(form.store, selector as any);
}

export function useFormSubmit() {
  const form = useFormContext();
  return form.handleSubmit;
}
