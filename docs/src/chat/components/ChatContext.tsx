import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";
import { DEFAULT_MODEL } from "../constants";
import { useStreamChat } from "../hooks/useStreamChat";
import type { ChatMessage } from "../types";

interface ChatContextValue {
  // Drawer / UI state
  isDrawerOpen: boolean;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  isDrawerClosing: boolean;
  setIsDrawerClosing: Dispatch<SetStateAction<boolean>>;
  entered: boolean;
  setEntered: Dispatch<SetStateAction<boolean>>;
  // Model selection
  model: string;
  setModel: Dispatch<SetStateAction<string>>;
  // Chat state (from useStreamChat)
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [entered, setEntered] = useState(false);
  const [model, setModel] = useState(() => {
    try {
      return localStorage.getItem("docs_chat_model") || DEFAULT_MODEL;
    } catch {
      return DEFAULT_MODEL;
    }
  });

  const { messages, isStreaming, sendMessage, clearMessages } =
    useStreamChat(model);

  return (
    <ChatContext.Provider
      value={{
        isDrawerOpen,
        setIsDrawerOpen,
        isDrawerClosing,
        setIsDrawerClosing,
        entered,
        setEntered,
        model,
        setModel,
        messages,
        isStreaming,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
