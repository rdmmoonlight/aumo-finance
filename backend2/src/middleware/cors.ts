import { cors } from 'hono/cors';
import { env } from '../lib/env.js';

function resolveAllowedOrigins(): string[] {
  const raw = env.CORS_ORIGINS ?? env.FRONTEND_URL ?? 'http://localhost:3000';
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

const allowedOrigins = resolveAllowedOrigins();

/**
 * CORS dengan allowlist origin eksplisit (wajib saat credentials: true,
 * karena cookie sesi tidak boleh dipakai bersama wildcard "*").
 */
export const corsMiddleware = () =>
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposeHeaders: ['X-Request-Id', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    maxAge: 86_400,
  });
