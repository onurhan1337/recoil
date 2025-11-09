import { z } from "zod";

export const uuidSchema = z.string().refine((val) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val);
}, "Invalid ID format");

export const noteSchema = z.object({
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note content must be less than 10,000 characters")
    .trim(),
  tags: z
    .preprocess(
      (val) => (val === null ? undefined : val),
      z.array(z.string().trim().min(1))
    )
    .optional()
    .default([]),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, "Content is required").max(10000).trim(),
  tags: z
    .preprocess(
      (val) => (val === null ? undefined : val),
      z.array(z.string().trim().min(1))
    )
    .optional()
    .default([]),
});

export const noteUpdateSchema = z.object({
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note content must be less than 10,000 characters")
    .trim(),
  tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
    .default([])
    .transform((tags) => tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
});

export const searchSchema = z.object({
  query: z
    .preprocess((val) => (val === null ? undefined : val), z.string())
    .pipe(
      z
        .string()
        .min(1, "Search query is required")
        .max(1000, "Search query must be less than 1,000 characters")
        .trim()
    ),
});

export const paginationSchema = z.object({
  limit: z
    .preprocess(
      (val) => (val === null || val === undefined ? "50" : val),
      z.string()
    )
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .preprocess(
      (val) => (val === null || val === undefined ? "0" : val),
      z.string()
    )
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

export const conversationCreateSchema = z.object({
  title: z
    .preprocess(
      (val) => (val === null || val === undefined ? "New Conversation" : val),
      z.string()
    )
    .pipe(z.string().max(200, "Title must be less than 200 characters").trim())
    .optional()
    .default("New Conversation"),
});

export const conversationUpdateSchema = z.object({
  title: z
    .preprocess((val) => (val === null ? undefined : val), z.string())
    .pipe(
      z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters")
        .trim()
    ),
});

export const displayNameSchema = z.object({
  displayName: z
    .preprocess((val) => (val === null ? undefined : val), z.string())
    .pipe(
      z
        .string()
        .min(1, "Display name is required")
        .max(50, "Display name must be 50 characters or less")
        .trim()
    ),
});

export const feedbackSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .preprocess(
      (val) => (val === null || val === "" ? undefined : val),
      z.string()
    )
    .pipe(
      z.string().max(1000, "Comment must be 1000 characters or less").trim()
    )
    .optional(),
});

export const chatMessagePartSchema = z.object({
  type: z
    .preprocess((val) => (val === null ? undefined : val), z.string())
    .pipe(z.string()),
  text: z
    .preprocess((val) => (val === null ? undefined : val), z.string())
    .pipe(z.string()),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  parts: z.array(chatMessagePartSchema),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required"),
  conversation_id: z
    .preprocess((val) => (val === null ? undefined : val), z.string())
    .pipe(
      z.string().refine((val) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(val);
      }, "Invalid conversation ID format")
    )
    .optional(),
});

export const emailSchema = z.object({
  email: z
    .preprocess((val) => (val === null ? undefined : val), z.string())
    .pipe(
      z
        .string()
        .refine((val) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(val);
        }, "Invalid email address")
        .toLowerCase()
    ),
});

export const passwordSchema = z.object({
  password: z
    .preprocess((val) => (val === null ? undefined : val), z.string())
    .pipe(
      z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must be less than 72 characters")
    ),
});

export const signupSchema = emailSchema.extend(passwordSchema.shape);
export const loginSchema = emailSchema.extend(passwordSchema.shape);

export type NoteInput = z.infer<typeof noteSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ConversationCreateInput = z.infer<typeof conversationCreateSchema>;
export type ConversationUpdateInput = z.infer<typeof conversationUpdateSchema>;
export type DisplayNameInput = z.infer<typeof displayNameSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
