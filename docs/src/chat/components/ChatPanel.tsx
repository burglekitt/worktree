"use client";
import { useChatContext } from "./ChatContext";
import { ChatForm } from "./ChatForm";
import { Messages } from "./Messages";

export function ChatPanel() {
  const { messages, isStreaming, sendMessage } = useChatContext();

  async function handleSubmit(message: string) {
    if (!message.trim() || isStreaming) return;
    await sendMessage(message);
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="flex flex-col h-full max-h-[90vh] border border-gray-200 dark:border-neutral-800 rounded-lg bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100">
        <Messages messages={messages} isStreaming={isStreaming} />
        <ChatForm onSubmit={handleSubmit} disabled={isStreaming} />
      </div>
    </div>
  );
}
