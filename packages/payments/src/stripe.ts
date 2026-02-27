import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get or create the Stripe client singleton.
 * @param secretKey - Stripe secret key (defaults to STRIPE_SECRET_KEY env var)
 */
export function getStripe(secretKey?: string): Stripe {
  if (!stripeInstance) {
    const key = secretKey ?? process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is required');
    stripeInstance = new Stripe(key, { apiVersion: '2024-04-10' });
  }
  return stripeInstance;
}

// ─── Customers ───────────────────────────────────────────────────────────────

/**
 * Create or retrieve a Stripe customer by email.
 * @param email - Customer email
 * @param name - Customer name
 * @param metadata - Additional metadata
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>,
): Promise<Stripe.Customer> {
  const stripe = getStripe();
  const existing = await stripe.customers.list({ email, limit: 1 });

  if (existing.data[0]) {
    return existing.data[0];
  }

  return stripe.customers.create({ email, name, metadata });
}

// ─── Payment Intents ─────────────────────────────────────────────────────────

export interface CreatePaymentIntentParams {
  amountSek: number;
  customerId: string;
  metadata?: Record<string, string>;
  description?: string;
  receiptEmail?: string;
}

/**
 * Create a Stripe Payment Intent for a one-time payment.
 * @param params - Payment parameters
 * @returns The created PaymentIntent
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams,
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount: Math.round(params.amountSek * 100),
    currency: 'sek',
    customer: params.customerId,
    metadata: params.metadata,
    description: params.description,
    receipt_email: params.receiptEmail,
    automatic_payment_methods: { enabled: true },
  });
}

// ─── Checkout Sessions ───────────────────────────────────────────────────────

export interface CreateCheckoutParams {
  customerId: string;
  lineItems: Array<{
    name: string;
    unitAmountSek: number;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  mode?: 'payment' | 'subscription';
}

/**
 * Create a Stripe Checkout Session.
 * @param params - Checkout parameters
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: params.mode ?? 'payment',
    line_items: params.lineItems.map((item) => ({
      price_data: {
        currency: 'sek',
        product_data: { name: item.name },
        unit_amount: Math.round(item.unitAmountSek * 100),
      },
      quantity: item.quantity,
    })),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    locale: 'sv',
  });
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

/**
 * Create a subscription for a customer using a Stripe Price ID.
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID
 * @param metadata - Additional metadata
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>,
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata,
  });
}

/**
 * Cancel a subscription at the end of the current billing period.
 * @param subscriptionId - Stripe subscription ID
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// ─── Stripe Terminal ─────────────────────────────────────────────────────────

/**
 * Create a connection token for Stripe Terminal (POS card reader).
 */
export async function createTerminalConnectionToken(): Promise<string> {
  const stripe = getStripe();
  const token = await stripe.terminal.connectionTokens.create();
  return token.secret;
}

/**
 * Create a PaymentIntent specifically for Stripe Terminal (in-person payments).
 * @param amountSek - Amount in SEK
 * @param metadata - Additional metadata
 */
export async function createTerminalPaymentIntent(
  amountSek: number,
  metadata?: Record<string, string>,
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount: Math.round(amountSek * 100),
    currency: 'sek',
    payment_method_types: ['card_present'],
    capture_method: 'automatic',
    metadata,
  });
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

/**
 * Refund a payment (full or partial).
 * @param paymentIntentId - The PaymentIntent ID to refund
 * @param amountSek - Optional partial refund amount in SEK (full refund if omitted)
 * @param reason - Refund reason
 */
export async function refundPayment(
  paymentIntentId: string,
  amountSek?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
): Promise<Stripe.Refund> {
  const stripe = getStripe();
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountSek ? Math.round(amountSek * 100) : undefined,
    reason,
  });
}

// ─── Webhooks ────────────────────────────────────────────────────────────────

/**
 * Verify and construct a Stripe webhook event from the raw body and signature.
 * @param rawBody - The raw request body as a string or Buffer
 * @param signature - The Stripe-Signature header value
 * @param webhookSecret - The webhook endpoint secret
 */
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

// ─── Customer Portal ─────────────────────────────────────────────────────────

/**
 * Create a Stripe Customer Portal session for subscription management.
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to redirect back to after portal
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
