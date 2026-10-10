import { cors } from 'hono/cors';
import { env } from '../lib/env.js';

function resolveAllowedOrigins(): string[] {
  const raw = env.CORS_ORIGINS ?? env.FRONTEND_URL ?? 'http://localhost:3000';
  const origins = raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  // Pastikan localhost selalu masuk allowlist untuk kebutuhan dev/testing
  const defaultLocalOrigins = [
    'http://localhost:3000',
    'https://aumo-finance-web.vercel.app/',
    'https://aumoweb.onrender.com',
  ];

  return Array.from(new Set([...origins, ...defaultLocalOrigins]));
}

const allowedOrigins = resolveAllowedOrigins();

export const corsMiddleware = () =>
  cors({
    origin: (origin) => {
      // 1. Jika request dari same-origin / browser address bar (origin undefined)
      if (!origin) return '*';

      // 2. Izinkan jika origin terdaftar di allowlist
      if (allowedOrigins.includes(origin)) return origin;

      // 3. Mode development: Izinkan semua origin localhost/127.0.0.1 dinamik
      if (
        env.NODE_ENV !== 'production' &&
        (origin.includes('localhost') || origin.includes('127.0.0.1'))
      ) {
        return origin;
      }

      return null;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposeHeaders: [
      'X-Request-Id',
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
    ],
    maxAge: 86_400,
  });
