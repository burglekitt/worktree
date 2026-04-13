"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatProvider } from "./ChatContext";
import { ChatDrawer } from "./ChatDrawer";

const queryClient = new QueryClient();

export function Chat() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <ChatDrawer />
      </ChatProvider>
    </QueryClientProvider>
  );
}
