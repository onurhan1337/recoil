export interface Note {
  id: string;
  content: string;
  title?: string | null;
  label?: string | null;
  category?: string | null;
  tags?: string[] | null;
  related_notes?: string[] | null;
  created_at: string;
  user_id: string;
  pinned?: boolean;
  favorite?: boolean;
  archived?: boolean;
  collections?: Collection[];
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
  updated_at: string;
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
  polar_customer_id?: string | null;
  polar_subscription_id?: string | null;
  subscription_status?: string | null;
  subscription_period_end?: string | null;
  last_processed_order_id?: string | null;
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

export interface BulkNoteInput {
  content: string;
  title?: string;
  tags?: string[];
}

export interface BulkCreateNotesResponse {
  success: boolean;
  notes: Note[];
  failedCount: number;
  successCount: number;
  totalCost: number;
  creditsRemaining: number;
  errors?: Array<{ index: number; error: string }>;
}

export interface MarkdownImportResult {
  success: boolean;
  notes: Note[];
  creditsRemaining: number;
  totalCost: number;
}

export interface Reminder {
  id: string;
  note_id: string;
  user_id: string;
  reminder_date: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  reminder_id?: string | null;
  note_id?: string | null;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface CreateReminderResponse {
  reminder: Reminder;
  message: string;
}

export interface RemindersListResponse {
  reminders: Reminder[];
}

export interface NotificationsListResponse {
  notifications: Notification[];
  unreadCount: number;
}
