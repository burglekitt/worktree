"use client";

import { Button } from "@base-ui/react";
import { Drawer } from "@base-ui/react/drawer";
import {
  ChatBubbleBottomCenterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
// Popover.Close is not exported; use a regular button to close
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatModelSelect } from "./ChatModelSelect";
import { ChatPanel } from "./ChatPanel";
import { cn } from "./cn";

const FREE_MODELS = [
  { label: "GPT-5 mini (free)", value: "openai/gpt-5.1-mini" },
  { label: "GPT-4.1 (free)", value: "openai/gpt-4.1" },
  { label: "GPT-3.5 (free)", value: "openai/gpt-3.5-turbo" },
  { label: "Mistral Small (free)", value: "mistral-small" },
  { label: "Llama Mini (free)", value: "llama-mini" },
  // Add more free models here as desired
];

export function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);
  const [model, setModel] = useState(() => {
    try {
      return localStorage.getItem("docs_chat_model") || FREE_MODELS[0].value;
    } catch {
      return FREE_MODELS[0].value;
    }
  });
  console.log("Selected model:", model);

  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem("docs_chat_model", model);
    } catch {
      // ignore
    }
  }, [model]);

  const modelOptions = useMemo(() => FREE_MODELS, []);

  const handleClear = () => {
    // bump key to remount ChatPanel (clears internal useChat state)
    setSessionKey((k) => k + 1);
  };

  const handleOpen = useCallback(() => {
    setIsClosing(false);
    setOpen(true);
    setEntered(false);
  }, []);

  const handleClose = useCallback(() => {
    // trigger CSS exit animation then unmount
    setIsClosing(true);
    setEntered(false);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 480);
  }, []);

  function handleModelChange(value: string | null): void {
    if (value) {
      setModel(value);
      handleClear();
    }
  }

  // keyboard: open chat with Ctrl+K for convenience
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // toggle using our handler so animations run
        if (open) handleClose();
        else handleOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose, handleOpen]);

  // Drive entrance using a short two-phase mount: render offscreen then set
  // `entered` on the next frame so CSS transition runs. This avoids the
  // instant pop when the element first mounts.
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    // Ensure we start off-screen, then flip to entered on next frame.
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => (v ? handleOpen() : handleClose())}
      swipeDirection="right"
    >
      <Drawer.Trigger
        onClick={() => handleOpen()}
        className="fixed right-6 bottom-6 z-[9999] w-16 h-16 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:ring focus:ring-blue-300 border-2 border-cyan-400 dark:border-cyan-500"
      >
        <ChatBubbleBottomCenterIcon className="w-7 h-7 text-white" />
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Backdrop
          ref={backdropRef}
          className={`bg-black/30 fixed inset-0 z-[9998] transition-opacity duration-300 ${
            open || isClosing ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
        <Drawer.Viewport className="z-50">
          <Drawer.Popup
            ref={popupRef}
            className={cn(
              // Positioning & painting hints
              "fixed top-0 bottom-0 right-0",
              "will-change-transform",

              // Stacking & sizing
              "z-[9999]",
              "w-[400px] max-w-full h-full",

              // Performance / rendering
              "transform-gpu",
              "webkitbackface-visibility-hidden",

              // Visuals
              "bg-white dark:bg-slate-900",
              "border-l border-gray-200 dark:border-gray-800",

              // Layout
              "flex flex-col shadow-2xl text-gray-900 dark:text-gray-100",

              // Animation
              "transition-transform duration-500 ease-in-out",

              // State: toggle translate for entrance/exit
              entered && !isClosing ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-lg">Chat</div>
                <ChatModelSelect
                  label="Model"
                  models={modelOptions}
                  onChange={handleModelChange}
                  selectedModel={model}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleClear}
                  className="px-2 py-1 text-sm border rounded bg-gray-100 dark:bg-slate-800"
                  aria-label="Clear conversation"
                >
                  Clear
                </Button>
                <Drawer.Close
                  aria-label="Close chat"
                  className="px-2 py-1 rounded text-sm border"
                  onClick={() => handleClose()}
                >
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </Drawer.Close>
              </div>
            </div>

            <ChatPanel key={sessionKey} model={model} />
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
