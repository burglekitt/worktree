import { createContext, useContext, useState } from "react";

// need a react context and provider to store shared actions

export const ChatContext = createContext<any>(null);

const FREE_MODELS = [
  { label: "GPT-5 mini (free)", value: "openai/gpt-5.1-mini" },
  { label: "GPT-4.1 (free)", value: "openai/gpt-4.1" },
  { label: "GPT-3.5 (free)", value: "openai/gpt-3.5-turbo" },
  { label: "Mistral Small (free)", value: "mistral-small" },
  { label: "Llama Mini (free)", value: "llama-mini" },
  // Add more free models here as desired
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [entered, setEntered] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [model, setModel] = useState(() => {
    try {
      return localStorage.getItem("docs_chat_model") || FREE_MODELS[0].value;
    } catch {
      return FREE_MODELS[0].value;
    }
  });

  // TODO
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
