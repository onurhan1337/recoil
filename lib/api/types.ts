export interface Note {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Usage {
  user_id: string;
  credits: number;
  last_reset: string;
}

export interface SearchResult {
  note: Note;
  similarity: number;
}

export interface CreateNoteResponse {
  success: boolean;
  note: Note;
  creditsRemaining: number;
}

export interface SearchNotesResponse {
  results: SearchResult[];
  summary: string;
  creditsRemaining: number;
}

export interface UsageResponse {
  credits: number;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface ConversationMessagesResponse {
  messages: Message[];
}
