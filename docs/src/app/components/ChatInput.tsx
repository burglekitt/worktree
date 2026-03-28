import { Input } from "@base-ui/react";
import { forwardRef } from "react";

// TODO This is bad
type FieldShape = {
  name: string;
  state: { value?: unknown; meta?: { isPending?: boolean } };
  handleBlur: () => void;
  handleChange: (v: unknown) => void;
};

interface ChatInputProps {
  field: unknown;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  function ChatInput({ field, placeholder, className, disabled }, ref) {
    const f = field as FieldShape;

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
