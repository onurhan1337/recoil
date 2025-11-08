export interface Note {
  id: string;
  content: string;
  label?: string | null;
  category?: string | null;
  tags?: string[] | null;
  related_notes?: string[] | null;
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

export type UserPlan = "free" | "pro";

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
  plan: UserPlan;
  monthly_credits_limit: number;
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
  plan: UserPlan;
  monthly_credits_limit: number;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface ConversationMessagesResponse {
  messages: Message[];
}

export interface NoteCostEstimate {
  estimated_cost: number;
  base_cost: number;
  embedding_cost: number;
  content_length: number;
  estimated_chunks: number;
}

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface CreateFeedbackResponse {
  feedback: Feedback;
  message: string;
}

export interface FeedbackListResponse {
  feedback: Feedback[];
}

export interface ChatMessagePart {
  type: string;
  text: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  parts: ChatMessagePart[];
}

export interface SearchNoteResult {
  id: string;
  content: string;
  similarity: number;
  category?: string | null;
  label?: string | null;
}
