import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

export interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
  roles: string[];
}

function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/**
 * Create a short-lived access token (15 minutes).
 * @param payload - User data to encode
 * @param secret - JWT signing secret
 */
export async function createAccessToken(
  payload: { sub: string; email: string; roles: string[] },
  secret: string,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer('yeshe-norbu')
    .sign(getSecret(secret));
}

/**
 * Create a long-lived refresh token (30 days).
 * @param payload - Minimal user data
 * @param secret - JWT signing secret
 */
export async function createRefreshToken(
  payload: { sub: string },
  secret: string,
): Promise<string> {
  return new SignJWT({ sub: payload.sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer('yeshe-norbu')
    .sign(getSecret(secret));
}

/**
 * Verify and decode a JWT token.
 * @param token - The JWT string to verify
 * @param secret - The signing secret
 * @returns The decoded payload
 * @throws If the token is invalid or expired
 */
export async function verifyToken(token: string, secret: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(secret), {
    issuer: 'yeshe-norbu',
  });
  return payload as TokenPayload;
}

/**
 * Create both access and refresh tokens for a user.
 * @param user - User data
 * @param secret - JWT signing secret
 */
export async function createTokenPair(
  user: { id: string; email: string; roles: string[] },
  secret: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken({ sub: user.id, email: user.email, roles: user.roles }, secret),
    createRefreshToken({ sub: user.id }, secret),
  ]);
  return { accessToken, refreshToken };
}
