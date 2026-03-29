"use client";

import { ChatProvider } from "./ChatContext";
import { ChatDrawer } from "./ChatDrawer";

export function Chat() {
  return (
    <ChatProvider>
      <ChatDrawer />
    </ChatProvider>
  );
}
