import { Drawer } from "@base-ui/react/drawer";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import { useChatContext } from "../../app/components/ChatContext";

export function ChatTrigger() {
  const { setIsDrawerOpen } = useChatContext();

  return (
    <Drawer.Trigger
      onClick={() => setIsDrawerOpen(true)}
      className="fixed right-6 bottom-6 z-[9999] w-16 h-16 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:ring focus:ring-blue-300 border-2 border-cyan-400 dark:border-cyan-500"
    >
      <ChatBubbleBottomCenterIcon className="w-7 h-7 text-white" />
    </Drawer.Trigger>
  );
}
