import { createContext, useContext, useState } from "react";
import { DEFAULT_MODEL } from "./constants";

export const ChatContext = createContext<any>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [entered, setEntered] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [model, setModel] = useState(() => {
    try {
      return localStorage.getItem("docs_chat_model") || DEFAULT_MODEL;
    } catch {
      return DEFAULT_MODEL;
    }
  });

  return (
    <ChatContext.Provider
      value={{
        isDrawerOpen,
        setIsDrawerOpen,
        isDrawerClosing,
        setIsDrawerClosing,
        entered,
        setEntered,
        sessionKey,
        setSessionKey,
        model,
        setModel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  if (!ChatContext) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return useContext(ChatContext);
}
