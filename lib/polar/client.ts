import { Polar } from "@polar-sh/sdk";
import { ResourceNotFound } from "@polar-sh/sdk/models/errors/resourcenotfound";

const polarAccessToken = process.env.POLAR_ACCESS_TOKEN!;

if (!polarAccessToken) {
  throw new Error("POLAR_ACCESS_TOKEN is not configured");
}

const polar = new Polar({
  accessToken: polarAccessToken,
  server: "sandbox",
});

/**
 * Check if an error indicates that a customer was not found
 * Uses ResourceNotFound instance or statusCode 404 or checks if error is a ResourceNotFound instance
 */
export function isCustomerNotFoundError(error: any): boolean {
  return (
    error instanceof ResourceNotFound ||
    error?.statusCode === 404 ||
    error?.name === "ResourceNotFound" ||
    error?.constructor?.name === "ResourceNotFound"
  );
}

/**
 * Create or get a Polar customer by external ID (Supabase user ID)
 * Note: When using an organization token, organizationId is automatically set
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string
): Promise<string> {
  try {
    try {
      const customerState = await polar.customers.getStateExternal({
        externalId: userId,
      });
      return customerState.id;
    } catch (error: any) {
      if (isCustomerNotFoundError(error)) {
        const customer = await polar.customers.create({
          email,
          externalId: userId,
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
