// PBKDF2 compatible con tu implementación C#
import { randomBytes, pbkdf2Sync } from 'crypto';

const SALT_SIZE = 16;
const HASH_SIZE = 20;
const ITERATIONS = 100000;
const DIGEST = 'sha256';

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_SIZE);
  const hash = pbkdf2Sync(password, salt, ITERATIONS, HASH_SIZE, DIGEST);
  return Buffer.concat([salt, hash]).toString('base64');
}

export function verifyPassword(password: string, base64Hash: string): boolean {
  if (!base64Hash) return false;
  const hashBytes = Buffer.from(base64Hash, 'base64');
  if (hashBytes.length !== SALT_SIZE + HASH_SIZE) return false;
  const salt = hashBytes.slice(0, SALT_SIZE);
  const storedHash = hashBytes.slice(SALT_SIZE);
  const derived = pbkdf2Sync(password, salt, ITERATIONS, HASH_SIZE, DIGEST);
  let diff = 0;
  for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ storedHash[i];
  return diff === 0;
}
