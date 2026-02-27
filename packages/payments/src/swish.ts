import { z } from 'zod';
import * as https from 'node:https';
import * as fs from 'node:fs';

// ─── Configuration ───────────────────────────────────────────────────────────

export interface SwishConfig {
  /** Path to the Swish merchant P12/PEM certificate */
  certPath: string;
  /** Path to the certificate key file */
  keyPath: string;
  /** Optional CA bundle path */
  caPath?: string;
  /** Passphrase for the certificate */
  passphrase?: string;
  /** Merchant Swish number (e.g. '1231181189') */
  payeeAlias: string;
  /** Base URL for callbacks */
  callbackBaseUrl: string;
  /** Use Swish test environment */
  testMode?: boolean;
}

const SWISH_API_BASE = 'https://cpc.getswish.net/swish-cpcapi/api';
const SWISH_TEST_API_BASE = 'https://mss.cpc.getswish.net/swish-cpcapi/api';

let config: SwishConfig | null = null;

/**
 * Initialize Swish with merchant credentials.
 * @param cfg - Swish configuration
 */
export function initSwish(cfg: SwishConfig): void {
  config = cfg;
}

function getConfig(): SwishConfig {
  if (!config) throw new Error('Swish not initialized. Call initSwish() first.');
  return config;
}

function getBaseUrl(): string {
  return getConfig().testMode ? SWISH_TEST_API_BASE : SWISH_API_BASE;
}

function createHttpsAgent(): https.Agent {
  const cfg = getConfig();
  return new https.Agent({
    cert: fs.readFileSync(cfg.certPath),
    key: fs.readFileSync(cfg.keyPath),
    ca: cfg.caPath ? fs.readFileSync(cfg.caPath) : undefined,
    passphrase: cfg.passphrase,
  });
}

// ─── Payment Request Schemas ─────────────────────────────────────────────────

export const swishECommerceSchema = z.object({
  /** Amount in SEK */
  amount: z.number().positive(),
  /** Payer's Swish phone number (for M-Commerce this is optional) */
  payerAlias: z.string().optional(),
  /** Message shown to payer (max 50 chars) */
  message: z.string().max(50).optional(),
  /** Your internal reference */
  payeePaymentReference: z.string().max(36).optional(),
});

export type SwishECommerceRequest = z.infer<typeof swishECommerceSchema>;

export interface SwishPaymentResponse {
  /** Payment request ID (UUID) */
  id: string;
  /** Location URL for polling status */
  location: string;
  /** Payment request token (for M-Commerce QR/deep link) */
  paymentRequestToken?: string;
}

// ─── E-Commerce Flow ─────────────────────────────────────────────────────────

/**
 * Create a Swish E-Commerce payment request.
 * The payer opens their Swish app and enters the amount, or scans a QR code.
 * @param params - Payment parameters
 * @returns Payment response with ID and location for status polling
 */
export async function createECommercePayment(
  params: SwishECommerceRequest,
): Promise<SwishPaymentResponse> {
  const cfg = getConfig();
  const validated = swishECommerceSchema.parse(params);

  const body = {
    payeeAlias: cfg.payeeAlias,
    amount: validated.amount.toFixed(2),
    currency: 'SEK',
    callbackUrl: `${cfg.callbackBaseUrl}/api/webhooks/swish`,
    message: validated.message ?? '',
    payeePaymentReference: validated.payeePaymentReference ?? '',
    ...(validated.payerAlias ? { payerAlias: validated.payerAlias } : {}),
  };

  const agent = createHttpsAgent();
  const response = await fetch(`${getBaseUrl()}/v2/paymentrequests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // @ts-expect-error Node.js fetch supports agent via dispatcher
    dispatcher: agent,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Swish payment request failed (${response.status}): ${errorBody}`);
  }

  const location = response.headers.get('location') ?? '';
  const paymentRequestToken = response.headers.get('paymentrequesttoken') ?? undefined;
  const id = location.split('/').pop() ?? '';

  return { id, location, paymentRequestToken };
}

// ─── M-Commerce Flow ─────────────────────────────────────────────────────────

/**
 * Create a Swish M-Commerce payment (no payer alias required).
 * Returns a token that can be used to generate a QR code or deep link.
 * @param params - Payment parameters (payerAlias not required)
 */
export async function createMCommercePayment(
  params: Omit<SwishECommerceRequest, 'payerAlias'>,
): Promise<SwishPaymentResponse> {
  return createECommercePayment(params);
}

/**
 * Generate a Swish deep link URL for M-Commerce (opens Swish app on mobile).
 * @param paymentRequestToken - Token from the payment response
 */
export function getSwishDeepLink(paymentRequestToken: string): string {
  return `swish://paymentrequest?token=${paymentRequestToken}&callbackurl=`;
}

/**
 * Generate data for a Swish QR code.
 * The QR code content is the payment request token prefixed with 'D'.
 * @param paymentRequestToken - Token from the payment response
 */
export function getSwishQrData(paymentRequestToken: string): string {
  return `D${paymentRequestToken}`;
}

// ─── Payment Status ──────────────────────────────────────────────────────────

export interface SwishPaymentStatus {
  id: string;
  payeePaymentReference: string;
  paymentReference: string;
  callbackUrl: string;
  payerAlias: string;
  payeeAlias: string;
  amount: number;
  currency: string;
  message: string;
  status: 'CREATED' | 'PAID' | 'DECLINED' | 'ERROR' | 'CANCELLED';
  dateCreated: string;
  datePaid: string | null;
  errorCode: string | null;
  errorMessage: string | null;
}

/**
 * Check the status of a Swish payment request.
 * @param paymentId - The payment request UUID
 */
export async function getPaymentStatus(paymentId: string): Promise<SwishPaymentStatus> {
  const agent = createHttpsAgent();
  const response = await fetch(`${getBaseUrl()}/v1/paymentrequests/${paymentId}`, {
    method: 'GET',
    // @ts-expect-error Node.js fetch supports agent via dispatcher
    dispatcher: agent,
  });

  if (!response.ok) {
    throw new Error(`Swish status check failed (${response.status})`);
  }

  return response.json() as Promise<SwishPaymentStatus>;
}

// ─── Callback Validation ─────────────────────────────────────────────────────

export const swishCallbackSchema = z.object({
  id: z.string().uuid(),
  payeePaymentReference: z.string(),
  paymentReference: z.string(),
  callbackUrl: z.string().url(),
  payerAlias: z.string(),
  payeeAlias: z.string(),
  amount: z.number(),
  currency: z.literal('SEK'),
  message: z.string(),
  status: z.enum(['PAID', 'DECLINED', 'ERROR', 'CANCELLED']),
  dateCreated: z.string(),
  datePaid: z.string().nullable(),
  errorCode: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
});

export type SwishCallback = z.infer<typeof swishCallbackSchema>;

/**
 * Parse and validate a Swish callback payload.
 * @param body - The raw callback body
 * @returns Validated callback data
 */
export function parseSwishCallback(body: unknown): SwishCallback {
  return swishCallbackSchema.parse(body);
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

export interface SwishRefundRequest {
  /** Original payment reference */
  originalPaymentReference: string;
  /** Amount to refund */
  amount: number;
  /** Message to payer */
  message?: string;
  /** Internal reference */
  payerPaymentReference?: string;
}

/**
 * Create a Swish refund request.
 * @param params - Refund parameters
 */
export async function createRefund(params: SwishRefundRequest): Promise<{ id: string; location: string }> {
  const cfg = getConfig();
  const body = {
    originalPaymentReference: params.originalPaymentReference,
    callbackUrl: `${cfg.callbackBaseUrl}/api/webhooks/swish/refund`,
    payerAlias: cfg.payeeAlias,
    amount: params.amount.toFixed(2),
    currency: 'SEK',
    message: params.message ?? '',
    payerPaymentReference: params.payerPaymentReference ?? '',
  };

  const agent = createHttpsAgent();
  const response = await fetch(`${getBaseUrl()}/v2/refunds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // @ts-expect-error Node.js fetch supports agent via dispatcher
    dispatcher: agent,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Swish refund failed (${response.status}): ${errorBody}`);
  }

  const location = response.headers.get('location') ?? '';
  const id = location.split('/').pop() ?? '';
  return { id, location };
}
