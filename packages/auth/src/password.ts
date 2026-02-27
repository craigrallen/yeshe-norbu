import argon2 from 'argon2';

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/**
 * Hash a plaintext password using Argon2id.
 * @param password - The plaintext password to hash
 * @returns The hashed password string
 */
export async function hash(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Verify a plaintext password against an Argon2id hash.
 * @param hash - The stored hash
 * @param password - The plaintext password to verify
 * @returns True if the password matches
 */
export async function verify(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
