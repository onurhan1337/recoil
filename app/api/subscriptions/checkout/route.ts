import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  authenticateUser,
  errorResponse,
  successResponse,
  withRateLimit,
} from "@/lib/api/utils";
import { polar, isCustomerNotFoundError } from "@/lib/polar/client";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    return withRateLimit(
      request,
      "/api/subscriptions/checkout",
      "POST",
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user?.email) {
          return errorResponse("User email not found", 400);
        }

        if (!process.env.POLAR_PRODUCT_PRICE_ID) {
          return errorResponse("Product price ID not configured", 500);
        }

        console.log(`[Checkout] Creating checkout for user ${user.id}`);

        try {
          await polar.customers.getStateExternal({
            externalId: user.id,
          });
          console.log(`[Checkout] Customer already exists for user ${user.id}`);
        } catch (error: any) {
          if (isCustomerNotFoundError(error)) {
            console.log(`[Checkout] Creating new customer for user ${user.id}`);
            await polar.customers.create({
              email: userData.user.email,
              externalId: user.id,
            });
            console.log(
              `[Checkout] Created customer with externalId: ${user.id}`
            );
          } else {
            throw error;
          }
        }

        const checkout = await polar.checkouts.create({
          products: [process.env.POLAR_PRODUCT_PRICE_ID],
          customerEmail: userData.user.email,
          metadata: {
            user_id: user.id,
            source: "upgrade_dialog",
          },
          successUrl: `${baseUrl}/?checkout=success`,
          customerBillingAddress: {
            country: "US",
          },
        });

        if (!checkout.url) {
          throw new Error("Checkout URL not returned from Polar");
        }

        console.log(`[Checkout] Created checkout session: ${checkout.id}`);

        return successResponse({ checkoutUrl: checkout.url });
      },
      supabase,
      user.id
    );
  } catch (error: any) {
    console.error("[Checkout] Error creating checkout:", error);
    console.error("[Checkout] Error details:", {
      message: error?.message,
      statusCode: error?.statusCode,
      body: error?.body,
      stack: error?.stack,
    });

    return errorResponse("Failed to create checkout session", 500);
  }
}
