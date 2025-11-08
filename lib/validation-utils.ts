import { z } from "zod";
import { errorResponse } from "./api/utils";

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: Response } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      response: errorResponse("Invalid request", 400),
    };
  }

  return { success: true, data: result.data };
}

export function validateParams<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  paramName = "parameter"
): { success: true; data: T } | { success: false; response: Response } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      response: errorResponse(`Invalid ${paramName}`, 400),
    };
  }

  return { success: true, data: result.data };
}

export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: Response } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      response: errorResponse("Invalid query parameters", 400),
    };
  }

  return { success: true, data: result.data };
}
