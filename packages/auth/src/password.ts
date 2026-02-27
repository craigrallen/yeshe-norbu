import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 * @param password - The plaintext password to hash
 * @returns The hashed password string
 */
export async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
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
