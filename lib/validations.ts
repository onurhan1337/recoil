import { z } from "zod";

export const noteSchema = z.object({
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note content must be less than 10,000 characters")
    .trim(),
  tags: z.array(z.string().trim()).optional(),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, "Content is required").max(10000).trim(),
  tags: z.array(z.string().trim()).optional(),
});

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(1000, "Search query must be less than 1,000 characters")
    .trim(),
});

export const notesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const emailSchema = z.object({
  email: z.email({ error: "Invalid email address" }).toLowerCase(),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

export const signupSchema = emailSchema.extend(passwordSchema.shape);
export const loginSchema = emailSchema.extend(passwordSchema.shape);

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const feedbackSchema = z.object({
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().max(1000, "Comment must be 1000 characters or less").trim().optional(),
});

export const updateDisplayNameSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be 50 characters or less")
    .trim(),
});

export const conversationSchema = z.object({
  title: z.string().max(200, "Title must be 200 characters or less").optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less").trim(),
});

export const chatMessagePartSchema = z.object({
  type: z.enum(["text", "image"]),
  text: z.string().optional(),
  image: z.string().optional(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  parts: z.array(chatMessagePartSchema),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "No messages provided"),
  conversation_id: z.string().uuid().optional(),
});

export type NoteInput = z.infer<typeof noteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type NotesQueryInput = z.infer<typeof notesQuerySchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type UpdateDisplayNameInput = z.infer<typeof updateDisplayNameSchema>;
export type ConversationInput = z.infer<typeof conversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
