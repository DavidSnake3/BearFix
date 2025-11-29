import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'YourVeryStrongSecretKeyWith32Characters!';
const JWT_EXPIRES = Number(process.env.JWT_EXPIRES_IN_SECONDS || 10);
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 5);

export function createJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${JWT_EXPIRES}s` });
}

export function getPrincipleFromExpiredToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;
  } catch (err) {
    throw err;
  }
}

export function createRefreshToken(): string {
  return crypto.randomBytes(64).toString('base64');
}

export function getRefreshExpiry(): Date {
  return new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
}

export type TokenApiDto = {
  accessToken: string;
  refreshToken: string;
};

export type EmailModel = {
  to: string;
  subject: string;
  content: string;
};

export type ResetPasswordDto = {
  correo?: string;
  emailToken?: string;
  newPassword?: string;
  confirmPassword?: string;
};