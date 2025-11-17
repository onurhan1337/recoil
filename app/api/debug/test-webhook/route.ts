import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api/utils";

/**
 * Test endpoint to verify webhooks can reach your server
 * This accepts any POST request and logs it
 */
export async function POST(request: NextRequest) {
  try {
    const debugToken = process.env.DEBUG_TOKEN!;
    const authHeader = request.headers.get("authorization");

    if (!debugToken || authHeader !== `Bearer ${debugToken}`) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());

    console.log("🧪 [Test Webhook] Received:", {
      timestamp: new Date().toISOString(),
      body,
      headers: {
        "webhook-id": headers["webhook-id"],
        "webhook-timestamp": headers["webhook-timestamp"],
        "webhook-signature":
          headers["webhook-signature"]?.substring(0, 20) + "...",
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
    return errorResponse(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
