import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcryptjs (pure JS, no native deps).
 * @param password - The plaintext password to hash
 * @returns The hashed password string
 */
export async function hash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 * @param hashValue - The stored hash
 * @param password - The plaintext password to verify
 * @returns True if the password matches
 */
export async function verify(hashValue: string, password: string): Promise<boolean> {
  return bcrypt.compare(password, hashValue);
}
