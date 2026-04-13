import { Button } from "@base-ui/react";
import {
  CubeTransparentIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../utils";
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
      className={cn(
        "bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white rounded-lg transition-colors",
        "disabled:opacity-80 disabled:cursor-not-allowed",
        "p-2 ml-2",
      )}
    >
      {isSubmitting ? (
        <CubeTransparentIcon className="w-5 h-5 animate-spin" />
      ) : (
        <RocketLaunchIcon className="w-5 h-5" />
      )}
    </Button>
  );
}
