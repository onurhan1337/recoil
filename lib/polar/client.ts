import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "production",
});

/**
 * Create or get a Polar customer by external ID (Supabase user ID)
 * Note: When using an organization token, organizationId is automatically set
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string
): Promise<string> {
  try {
    // Try to get existing customer by external ID
    try {
      const customerState = await polar.customers.getStateExternal({
        externalId: userId,
      });
      return customerState.id;
    } catch (error: any) {
      // Customer doesn't exist, create one
      if (error.statusCode === 404 || error.message?.includes("not found")) {
        const customer = await polar.customers.create({
          email,
          externalId: userId,
          // organizationId is not needed when using an organization token
        });
        return customer.id;
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating/getting Polar customer:", error);
    throw error;
  }
}

/**
 * Create a checkout session for subscription
 * Note: Checkout sessions use a products array, not productPriceId
 */
export async function createCheckoutSession(
  customerEmail: string,
  userId: string,
  successUrl: string
): Promise<string> {
  try {
    if (!process.env.POLAR_PRODUCT_PRICE_ID) {
      throw new Error("POLAR_PRODUCT_PRICE_ID is not configured");
    }

    const checkout = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_PRICE_ID],
      customerEmail,
      metadata: {
        user_id: userId,
      },
      successUrl,
      customerBillingAddress: {
        country: "US",
      },
    });

    if (!checkout.url) {
      throw new Error("Checkout URL not returned from Polar");
    }

    return checkout.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Get subscription details by ID
 */
export async function getSubscription(subscriptionId: string) {
  try {
    return await polar.subscriptions.get({ id: subscriptionId });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
}

/**
 * Verify webhook signature
 * Note: Webhook verification is handled by @polar-sh/nextjs Webhooks component
 * This function is deprecated - use the Webhooks component from @polar-sh/nextjs instead
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): any {
  // This is now handled by the @polar-sh/nextjs Webhooks component
  // See app/api/webhooks/polar/route.ts for the implementation
  console.warn(
    "verifyWebhookSignature is deprecated. Use @polar-sh/nextjs Webhooks component instead"
  );
  throw new Error(
    "Use @polar-sh/nextjs Webhooks component for webhook verification"
  );
}

/**
 * Get customer subscription status by customer ID
 * Note: When using an organization token, organizationId is automatically set
 */
export async function getCustomerSubscriptions(customerId: string) {
  try {
    const subscriptionsIterator = await polar.subscriptions.list({
      customerId,
      // organizationId is not needed when using an organization token
      limit: 100,
    });

    const allSubscriptions = [];
    for await (const page of subscriptionsIterator) {
      const items = page.result?.items || [];
      allSubscriptions.push(...items);
    }

    return allSubscriptions;
  } catch (error) {
    console.error("Error fetching customer subscriptions:", error);
    throw error;
  }
}

export { polar };
