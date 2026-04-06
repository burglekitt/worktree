"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { ChatSubmitButton } from "./ChatSubmitButton";
import { FormField, FormProvider } from "./form/FormContext";

interface ChatFormProps {
  onSubmit: (message: string) => Promise<void> | void;
  disabled?: boolean;
}

export function ChatForm({ onSubmit, disabled }: ChatFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: { message: "" },
    validators: {
      onSubmit: ({ value }) => {
        if (!value.message || value.message.trim().length === 0) {
          return "Message is required";
        }
      },
    },
    onSubmit: async ({ value }) => {
      const msg = value.message.trim();
      if (!msg) return;
      await onSubmit(msg);
      form.reset();
      setTimeout(() => inputRef.current?.focus(), 0);
    },
  });

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 180);
    return () => clearTimeout(t);
  }, []);

  return (
    <FormProvider form={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
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
