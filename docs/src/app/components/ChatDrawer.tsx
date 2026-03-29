"use client";

import { Button } from "@base-ui/react";
import { Drawer } from "@base-ui/react/drawer";
import { XMarkIcon } from "@heroicons/react/24/outline";
// Popover.Close is not exported; use a regular button to close
import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "../../utils";
import { useChatContext } from "./ChatContext";
import { ChatModelSelect } from "./ChatModelSelect";
import { ChatPanel } from "./ChatPanel";
import { ChatTrigger } from "./ChatTrigger";

const FREE_MODELS = [
  { label: "GPT-5 mini (free)", value: "openai/gpt-5.1-mini" },
  { label: "GPT-3.5 (free)", value: "openai/gpt-3.5-turbo" },
];

export function ChatDrawer() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isDrawerClosing,
    setIsDrawerClosing,
    entered,
    sessionKey,
    setSessionKey,
    setEntered,
    model,
    setModel,
  } = useChatContext();

  const popupRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const modelOptions = useMemo(() => FREE_MODELS, []);

  const updateSessionKey = useCallback(() => {
    // bump key to remount ChatPanel (clears internal useChat state)
    setSessionKey((k: number) => k + 1);
  }, [setSessionKey]);

  const handleOpen = useCallback(() => {
    setIsDrawerClosing(false);
    setIsDrawerOpen(true);
    setEntered(false);
  }, [setIsDrawerOpen, setIsDrawerClosing, setEntered]);

  const handleClose = useCallback(() => {
    // trigger CSS exit animation then unmount
    setIsDrawerClosing(true);
    setEntered(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setIsDrawerClosing(false);
    }, 480);
  }, [setIsDrawerOpen, setIsDrawerClosing, setEntered]);

  function handleModelChange(value: string | null): void {
    if (value) {
      setModel(value);
      updateSessionKey();
    }
  }

  // Persist selected model to localStorage so it sticks across sessions.
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
        // toggle using our handler so animations run
        if (isDrawerOpen) handleClose();
        else handleOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, handleClose, handleOpen]);

  // Drive entrance using a short two-phase mount: render offscreen then set
  // `entered` on the next frame so CSS transition runs. This avoids the
  // instant pop when the element first mounts.
  useEffect(() => {
    if (!isDrawerOpen) {
      setEntered(false);
      return;
    }
    // Ensure we start off-screen, then flip to entered on next frame.
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [isDrawerOpen, setEntered]);

  return (
    <Drawer.Root
      open={isDrawerOpen}
      onOpenChange={(v) => (v ? handleOpen() : handleClose())}
      swipeDirection="right"
    >
      <ChatTrigger />

      <Drawer.Portal>
        <Drawer.Backdrop
          ref={backdropRef}
          className={`bg-black/30 fixed inset-0 z-[9998] transition-opacity duration-300 ${
            isDrawerOpen || isDrawerClosing
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
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
              entered && !isDrawerClosing
                ? "translate-x-0"
                : "translate-x-full",
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
                  onClick={updateSessionKey}
                  className="px-2 py-1 text-sm border rounded bg-gray-100 dark:bg-slate-800"
                  aria-label="Clear conversation"
                >
                  Clear
                </Button>
                <Drawer.Close
                  aria-label="Close chat"
                  className="px-2 py-1 rounded text-sm border"
                  onClick={handleClose}
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
