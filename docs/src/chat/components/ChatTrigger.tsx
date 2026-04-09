import { Drawer } from "@base-ui/react/drawer";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import { useChatContext } from "./ChatContext";

export function ChatTrigger() {
  const { isDrawerOpen } = useChatContext();

  return (
    <Drawer.Trigger
      aria-label={isDrawerOpen ? "Close chat" : "Open chat"}
      className="fixed right-6 bottom-6 z-[9999] w-16 h-16 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 active:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 focus:ring focus:ring-blue-300 dark:focus:ring-blue-500/40 border-2 border-blue-400 dark:border-blue-300 transition-colors"
    >
      <ChatBubbleBottomCenterIcon className="w-7 h-7 text-white" />
    </Drawer.Trigger>
  );
}
