export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** Unix ms timestamp of when the message was created */
  createdAt: number;
  /** True while the assistant is still streaming this message */
  streaming?: boolean;
  /** True if the message is a hard error (connection failure, no body, etc.) */
  isError?: boolean;
  /** True if the message is a recoverable warning (rate limit, validation, etc.) */
  isWarning?: boolean;
}
