import { authenticator } from 'otplib';
import QRCode from 'qrcode';

const ISSUER = 'Yeshin Norbu';

/**
 * Generate a new TOTP secret for a user.
 * @param email - User email for the authenticator label
 * @returns The secret and an otpauth:// URI
 */
export function generateTotpSecret(email: string): { secret: string; uri: string } {
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(email, ISSUER, secret);
  return { secret, uri };
}

/**
 * Generate a QR code data URL for the TOTP URI.
 * @param uri - The otpauth:// URI
 * @returns A data URL (PNG) of the QR code
 */
export async function generateQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri);
}

/**
 * Verify a TOTP token against a stored secret.
 * @param token - The 6-digit code from the user
 * @param secret - The stored TOTP secret
 * @returns True if valid
 */
export function verifyTotp(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}
