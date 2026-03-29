"use client";

import { type ReactNode, useContext } from "react";
import { FormContext } from "./Form";

interface FieldProps<T = any> {
  name: string;
  children: (field: T) => ReactNode;
}

export function FormField<T = any>({ name, children }: FieldProps<T>) {
  const form = useContext(FormContext);
  if (!form) return null;

  // form.Field is provided by the tanstack form instance
  const FieldComp = (form as any).Field;
  if (!FieldComp) return null;

  return <FieldComp name={name}>{(field: any) => children(field)}</FieldComp>;
}

export default FormField;
