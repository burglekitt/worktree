"use client";

import { useStore } from "@tanstack/react-store";
import type React from "react";
import { createContext, useContext } from "react";

const FormContext = createContext<any | null>(null);
const FieldContext = createContext<any | null>(null);

export function FormProvider({
  form,
  children,
}: {
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

export function FormField({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const form = useFormContext();
  const Comp = (form as any).Field as React.ComponentType<any>;
  if (!Comp) {
    // Fallback: render children directly
    return <>{children}</>;
  }

  return (
    <Comp name={name}>
      {(field: any) => (
        <FieldContext.Provider value={field}>{children}</FieldContext.Provider>
      )}
    </Comp>
  );
}

export function useField() {
  const f = useContext(FieldContext);
  if (!f) throw new Error("useField must be used inside a FormField");
  return f;
}

export function useFormStore<T>(selector: (s: any) => T) {
  const form = useFormContext();
  return useStore(form.store, selector as any);
}

export function useFormSubmit() {
  const form = useFormContext();
  return form.handleSubmit;
}
