import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/utils";

/**
 * Test endpoint to verify webhooks can reach your server
 * This accepts any POST request and logs it
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());

    console.log("🧪 [Test Webhook] Received:", {
      timestamp: new Date().toISOString(),
      body,
      headers: {
        "webhook-id": headers["webhook-id"],
        "webhook-timestamp": headers["webhook-timestamp"],
        "webhook-signature": headers["webhook-signature"]?.substring(0, 20) + "...",
      },
    });

    return successResponse({
      received: true,
      timestamp: new Date().toISOString(),
      event_type: body.type,
      subscription_id: body.data?.id,
    });
  } catch (error) {
    console.error("🧪 [Test Webhook] Error:", error);
    return successResponse({
      received: true,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
