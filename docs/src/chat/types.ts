export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** Unix ms timestamp of when the message was created */
  createdAt: number;
  /** True while the assistant is still streaming this message */
  streaming?: boolean;
  /** True if the message is an error */
  isError?: boolean;
}
