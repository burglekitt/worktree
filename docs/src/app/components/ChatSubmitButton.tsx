import { Button } from "@base-ui/react";

interface ChatSubmitButtonProps {
  disabled?: boolean;
}

export function ChatSubmitButton({ disabled }: ChatSubmitButtonProps) {
  // TODO needs form context
  return (
    <Button
      type="submit"
      disabled={
        disabled
        // f.state.meta?.isPending ||
        // !String(f.state.value || "").trim()
      }
      className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 ml-2"
    >
      Send
    </Button>
  );
}
