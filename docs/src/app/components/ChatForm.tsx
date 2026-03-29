"use client";

import {
  initialFormState,
  mergeForm,
  useForm,
  useTransform,
} from "@tanstack/react-form-nextjs";
import { useStore } from "@tanstack/react-store";
import { useActionState, useEffect, useRef } from "react";
import { chatAction } from "../actions/chatAction";
import { ChatInput } from "./ChatInput";
import { ChatSubmitButton } from "./ChatSubmitButton";
import { FormField, FormProvider } from "./form/FormContext";

interface ChatFormProps {
  onSubmit: (message: string) => Promise<void> | void;
  disabled?: boolean;
}

export function ChatForm({ onSubmit, disabled }: ChatFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep server action state in sync with the client form
  const [state, action] = useActionState(chatAction, initialFormState as any);

  const form = useForm({
    // base options
    defaultValues: { message: "" },
    transform: useTransform((base) => mergeForm(base, state ?? {}), [state]),
  } as any);

  // subscribe to values and errors
  const values = useStore(form.store, (s) => s.values as any);
  const errors = useStore(form.store, (s) => s.errors as any);

  // Focus the input when the form mounts (allow entrance animation to start).
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 180);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    // Submit to the server action which performs server-side validation.
    await form.handleSubmit?.();

    // If server returned no errors, perform client-side send
    if (!errors || Object.keys(errors).length === 0) {
      const msg = String(values?.message ?? "").trim();
      if (msg) {
        await onSubmit(msg);
        // reset the form client-side
        form.reset?.();
        // focus the input after DOM updates
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  }

  return (
    <FormProvider form={form}>
      <form
        action={action as never}
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="flex gap-2">
          <FormField name="message">
            <ChatInput
              ref={inputRef}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              disabled={disabled}
            />
          </FormField>
          <ChatSubmitButton disabled={disabled} />
        </div>
      </form>
    </FormProvider>
  );
}
