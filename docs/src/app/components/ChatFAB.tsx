"use client";

import { Button } from "@base-ui/react";
import { Drawer } from "@base-ui/react/drawer";
import { Select } from "@base-ui/react/select";
import {
  ChatBubbleBottomCenterIcon,
  CheckIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
// Popover.Close is not exported; use a regular button to close
import { useEffect, useMemo, useState } from "react";
import { ChatPanel } from "./ChatPanel";

const FREE_MODELS = [
  { label: "GPT-3.5 (free)", value: "openai/gpt-3.5-turbo" },
  { label: "Mistral Small (free)", value: "mistral-small" },
  { label: "Llama Mini (free)", value: "llama-mini" },
  // Add more free models here as desired
  { label: "GPT-5 mini (free)", value: "openai/gpt-5.1-mini" },
  { label: "GPT-4.1 (free)", value: "openai/gpt-4.1" },
];

export function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState(() => {
    try {
      return localStorage.getItem("docs_chat_model") || FREE_MODELS[0].value;
    } catch {
      return FREE_MODELS[0].value;
    }
  });

  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem("docs_chat_model", model);
    } catch {
      // ignore
    }
  }, [model]);

  // keyboard: open chat with Ctrl+K for convenience
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const modelOptions = useMemo(() => FREE_MODELS, []);

  const handleClear = () => {
    // bump key to remount ChatPanel (clears internal useChat state)
    setSessionKey((k) => k + 1);
  };

  function handleModelChange(value: string | null): void {
    if (value) {
      setModel(value);
      handleClear();
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="right">
      <Drawer.Trigger
        aria-label="Open chat"
        className="bg-blue-600 position-fixed rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 9999,
          background: "#00f0ff",
          color: "#fff",
          boxShadow: "0 0 16px 4px #00f0ff, 0 2px 8px #0002",
          border: "2px solid #00e0ff",
        }}
      >
        <ChatBubbleBottomCenterIcon style={{ width: 28, height: 28 }} />
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Backdrop className="bg-black/30" />
        <Drawer.Viewport className="z-50">
          <Drawer.Popup className="w-[400px] max-w-full h-full bg-white border-l flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-lg">Chat</div>
                <Select.Root
                  items={modelOptions}
                  value={model}
                  onValueChange={handleModelChange}
                >
                  <Select.Label className="text-sm text-gray-500">
                    Model:
                  </Select.Label>
                  <Select.Trigger className="px-2 py-1 border rounded flex items-center gap-1 min-w-[120px]">
                    <Select.Value placeholder="Select model" />
                    <Select.Icon>
                      <ChevronUpIcon />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner sideOffset={8} className="z-50">
                      <Select.ScrollUpArrow />
                      <Select.Popup className="bg-white border rounded shadow-lg">
                        <Select.List>
                          {modelOptions.map(({ label, value }) => (
                            <Select.Item
                              key={value}
                              value={value}
                              className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-blue-50"
                            >
                              <Select.ItemText>{label}</Select.ItemText>
                              <Select.ItemIndicator>
                                <CheckIcon className="text-blue-500" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                      <Select.ScrollDownArrow />
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleClear}
                  className="px-2 py-1 text-sm border rounded bg-gray-100"
                  aria-label="Clear conversation"
                >
                  Clear
                </Button>
                <Drawer.Close asChild>
                  <button
                    type="button"
                    aria-label="Close chat"
                    className="px-2 py-1 rounded text-sm bg-red-50 border"
                    onClick={() => setOpen(false)}
                  >
                    <XMarkIcon style={{ width: 16, height: 16 }} />
                  </button>
                </Drawer.Close>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <ChatPanel key={sessionKey} model={model} />
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
