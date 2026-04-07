import { Input } from "@base-ui/react";
import { forwardRef } from "react";
import { useField } from "../form/FormContext";

interface ChatInputProps {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  function ChatInput({ placeholder, className, disabled }, ref) {
    const f = useField();
    return (
      <Input
        ref={ref}
        type="text"
        name={f.name}
        value={String(f.state.value ?? "")}
        onBlur={f.handleBlur}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          f.handleChange(e.target.value)
        }
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    );
  },
);
ChatInput.displayName = "ChatInput";
