"use client";

import { Button } from "@base-ui/react";
import { Drawer } from "@base-ui/react/drawer";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "../../utils";
import { FREE_MODELS } from "../constants";
import { useChatContext } from "./ChatContext";
import { ChatModelSelect } from "./ChatModelSelect";
import { ChatPanel } from "./ChatPanel";
import { ChatTrigger } from "./ChatTrigger";

export function ChatDrawer() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isDrawerClosing,
    setIsDrawerClosing,
    entered,
    setEntered,
    model,
    setModel,
    clearMessages,
  } = useChatContext();

  const popupRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const modelOptions = useMemo(() => FREE_MODELS, []);

  const handleOpen = useCallback(() => {
    setIsDrawerClosing(false);
    setIsDrawerOpen(true);
    setEntered(false);
  }, [setIsDrawerOpen, setIsDrawerClosing, setEntered]);

  const handleClose = useCallback(() => {
    setIsDrawerClosing(true);
    setEntered(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setIsDrawerClosing(false);
    }, 480);
  }, [setIsDrawerOpen, setIsDrawerClosing, setEntered]);

  function handleModelChange(value: string | null): void {
    if (value) {
      // Each model has its own storage key — just switch; don't clear.
      // clearMessages() is only for the explicit Clear button.
      setModel(value);
    }
  }

  // keyboard: open chat with Ctrl+K for convenience
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isDrawerOpen) handleClose();
        else handleOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, handleClose, handleOpen]);

  // Drive entrance animation via two-phase mount.
  useEffect(() => {
    if (!isDrawerOpen) {
      setEntered(false);
      return;
    }
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
              "fixed top-0 bottom-0 right-0",
              "will-change-transform",
              "z-[9999]",
              "w-[400px] max-w-full h-full",
              "transform-gpu",
              "webkitbackface-visibility-hidden",
              "bg-gray-50 dark:bg-neutral-950",
              "border-l border-gray-200 dark:border-neutral-800",
              "flex flex-col shadow-2xl text-gray-900 dark:text-gray-100",
              "transition-transform duration-500 ease-in-out",
              entered && !isDrawerClosing
                ? "translate-x-0"
                : "translate-x-full",
            )}
          >
            <div className="flex flex-col p-4 border-b border-gray-200 dark:border-neutral-800 gap-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">
                  Chat with the Worktree CLI docs
                </h2>
                <Drawer.Close
                  aria-label="Close chat"
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
                  onClick={handleClose}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Drawer.Close>
              </div>
              <div className="flex items-center justify-between gap-4">
                <ChatModelSelect
                  label="Model"
                  models={modelOptions}
                  onChange={handleModelChange}
                  selectedModel={model}
                />
                <Button
                  onClick={clearMessages}
                  className="px-2 py-1 text-sm border rounded bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700"
                  aria-label="Clear conversation"
                >
                  Clear
                </Button>
              </div>
            </div>

            <ChatPanel />
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
