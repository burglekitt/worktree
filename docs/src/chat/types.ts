export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** True while the assistant is still streaming this message */
  streaming?: boolean;
}
