import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db.js';
import * as schema from '../db/schema/index.js';

console.log('BETTER AUTH: Loading...');

let auth: any;

try {
  console.log('BETTER AUTH: Creating adapter...');
  const adapter = drizzleAdapter(db as any, {
    provider: 'pg',
    schema: schema as any,
  });
  console.log('BETTER AUTH: Adapter OK');

  console.log('BETTER AUTH: Creating betterAuth instance...');
  auth = betterAuth({
    database: adapter,
    secret: process.env.BETTER_AUTH_SECRET || 'test-secret-for-debug-only-32chars',
    emailAndPassword: { enabled: true },
    trustedOrigins: ['http://localhost:3000'],
  });
  console.log('BETTER AUTH: Instance OK');
} catch (e: any) {
  console.error('BETTER AUTH FAILED:', e.message);
  console.error(e?.stack);
  // Mock auth to let app start
  auth = {
    api: {},
    handler: async () => new Response('Auth mock'),
  };
  console.log('BETTER AUTH: Using mock due to failure');
}

export { auth };