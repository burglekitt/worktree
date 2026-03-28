"use client";

import { useForm } from "@tanstack/react-form-nextjs";
import { useRef } from "react";
import { ChatInput } from "./ChatInput";
import { ChatSubmitButton } from "./ChatSubmitButton";

interface ChatFormProps {
  onSubmit: (message: string) => Promise<void> | void;
  disabled?: boolean;
}

export function ChatForm({ onSubmit, disabled }: ChatFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm({
    defaultValues: { message: "" },
    onSubmit: async ({ value, formApi }) => {
      if (!value?.message?.trim()) return;
      await onSubmit(value.message.trim());
      // reset the form (clears fields to defaults)
      formApi.reset();
      formApi.setFieldValue("message", ""); // ensure message field is cleared after reset
      // TODO focus the input after submit
      inputRef.current?.focus();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit?.();
      }}
      className="p-4 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="flex gap-2">
        <form.Field name="message">
          {(field) => (
            <ChatInput
              ref={inputRef}
              field={field}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              disabled={disabled}
            />
          )}
        </form.Field>
        <ChatSubmitButton disabled={disabled} />
      </div>
    </form>
  );
}
