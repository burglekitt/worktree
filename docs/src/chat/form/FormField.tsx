"use client";

import type { ReactNode } from "react";
import { useFormContext } from "./FormContext";

// biome-ignore lint/suspicious/noExplicitAny: field type is resolved at call site via generic T
interface FieldProps<T = any> {
  name: string;
  children: (field: T) => ReactNode;
}

// biome-ignore lint/suspicious/noExplicitAny: field type is resolved at call site via generic T
export function FormField<T = any>({ name, children }: FieldProps<T>) {
  const form = useFormContext();
  if (!form) return null;

  // biome-ignore lint/suspicious/noExplicitAny: form.Field type depends on form data shape unknown here
  const FieldComp = (form as any).Field;
  if (!FieldComp) return null;

  // biome-ignore lint/suspicious/noExplicitAny: field type resolved at call site
  return <FieldComp name={name}>{(field: any) => children(field)}</FieldComp>;
}

export default FormField;
