import { vi } from 'vitest';

// Set dummy env variables sebelum modul/app di-import
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
process.env.GOOGLE_CLIENT_ID = 'mock-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'mock-google-client-secret';
process.env.JWT_SIGNING_KEY = 'mock-jwt-signing-key-super-secret';
process.env.AUTH_RATE_LIMIT_MAX = '100';
process.env.RATE_LIMIT_WINDOW_MS = '60000';

