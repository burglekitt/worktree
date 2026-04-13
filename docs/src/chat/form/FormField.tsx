import type { ReactNode } from "react";
import { FieldContext } from "./FieldContext";
import { useFormContext } from "./FormContext";

interface FormFieldProps {
  name: string;
  children: ReactNode;
}

export function FormField({ name, children }: FormFieldProps) {
  const form = useFormContext();
  // biome-ignore lint/suspicious/noExplicitAny: form.Field type depends on form data shape unknown here
  const Comp = (form as any).Field as React.ComponentType<any>;
  if (!Comp) {
    return <>{children}</>;
  }

  return (
    <Comp name={name}>
      {/* biome-ignore lint/suspicious/noExplicitAny: field type is resolved at usage */}
      {(field: any) => (
        <FieldContext.Provider value={field}>{children}</FieldContext.Provider>
      )}
    </Comp>
  );
}
