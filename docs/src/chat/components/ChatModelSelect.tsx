import { Select } from "@base-ui/react/select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import type { AllowedModel, FREE_MODELS } from "../constants";

interface ChatModelSelectProps {
  label: string;
  models: typeof FREE_MODELS;
  onChange: (model: AllowedModel) => void;
  selectedModel?: string;
}

export function ChatModelSelect({
  label,
  models,
  selectedModel,
  onChange,
}: ChatModelSelectProps) {
  const [open, setOpen] = useState(false);

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
  }

  return (
    <Select.Root
      value={selectedModel}
      onValueChange={(v: unknown) => v && onChange(v as AllowedModel)}
      onOpenChange={handleOpenChange}
      id="model-select"
    >
      <div className="flex items-center gap-2">
        <label
          className="text-sm text-gray-500 dark:text-gray-400"
          htmlFor="model-select"
        >
          {label}:
        </label>
        <Select.Trigger
          className="px-2 py-1 border rounded flex items-center gap-2"
          aria-label={label}
        >
          <Select.Value placeholder="Select model" />
          <Select.Icon>
            {open ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            )}
          </Select.Icon>
        </Select.Trigger>
      </div>

      <Select.Portal>
        <Select.Positioner
          sideOffset={8}
          positionMethod="fixed"
          alignItemWithTrigger={false}
          className="z-[10001]"
        >
          <Select.Popup className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded shadow-lg">
            <Select.ScrollUpArrow className="text-white" />
            <Select.List>
              {models.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-neutral-800"
                >
                  <Select.ItemIndicator>
                    <CheckIcon className="text-blue-500" />
                  </Select.ItemIndicator>
                  <Select.ItemText>{label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
            <Select.ScrollDownArrow className="text-white" />
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
