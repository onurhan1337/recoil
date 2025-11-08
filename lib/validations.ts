import { z } from "zod";

export const noteSchema = z.object({
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note content must be less than 10,000 characters")
    .trim(),
  tags: z.array(z.string().trim()).optional(),
});

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(1000, "Search query must be less than 1,000 characters")
    .trim(),
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

export type NoteInput = z.infer<typeof noteSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
