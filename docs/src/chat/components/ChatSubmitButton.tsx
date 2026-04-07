import { Button } from "@base-ui/react";
import { useFormStore } from "../form/FormContext";

interface ChatSubmitButtonProps {
  disabled?: boolean;
}

export function ChatSubmitButton({ disabled }: ChatSubmitButtonProps) {
  const value = useFormStore((s) => s.values?.message);
  const isSubmitting = useFormStore((s) => s.isSubmitting);

  return (
    <Button
      type="submit"
      disabled={!!(disabled || isSubmitting || !String(value ?? "").trim())}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 ml-2"
    >
      {isSubmitting ? "..." : "Send"}
    </Button>
  );
}
