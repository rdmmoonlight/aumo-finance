import { cors } from 'hono/cors';
import { env } from '../lib/env.js';

function resolveAllowedOrigins(): string[] {
  const raw = env.CORS_ORIGINS ?? env.FRONTEND_URL ?? 'http://localhost:3000';
  
  const origins = raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  // Pastikan SEMUA URL di sini bersih dari trailing slash
  const defaultLocalOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://aumo-finance-web.vercel.app', // Hapus trailing slash '/'
    'https://aumoweb.onrender.com',
  ];

  const combined = [...origins, ...defaultLocalOrigins].map((o) =>
    o.trim().replace(/\/$/, '')
  );

  return Array.from(new Set(combined));
}

const allowedOrigins = resolveAllowedOrigins();

export const corsMiddleware = () =>
  cors({
    origin: (origin) => {
      // 1. Jika request dari same-origin / non-browser client (misal: Postman/cURL)
      if (!origin) return '*';

      // Clean origin dari browser just in case
      const cleanOrigin = origin.replace(/\/$/, '');

      // 2. Izinkan jika origin terdaftar di allowlist
      if (allowedOrigins.includes(cleanOrigin)) return cleanOrigin;

      // 3. Mode development: Izinkan semua origin localhost/127.0.0.1
      if (
        env.NODE_ENV !== 'production' &&
        (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1'))
      ) {
        return cleanOrigin;
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
