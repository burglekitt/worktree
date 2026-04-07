"use client";
import { useChatContext } from "../../app/components/ChatContext";
import { ChatForm } from "../../app/components/ChatForm";
import { Messages } from "./Messages";

export function ChatPanel() {
  const { messages, isStreaming, sendMessage } = useChatContext();

  async function handleSubmit(message: string) {
    if (!message.trim() || isStreaming) return;
    await sendMessage(message);
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="flex flex-col h-full max-h-[90vh] border rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
        <Messages messages={messages} />
        <ChatForm onSubmit={handleSubmit} disabled={isStreaming} />
      </div>
    </div>
  );
}
