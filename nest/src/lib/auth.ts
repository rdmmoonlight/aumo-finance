import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '../db/schema/index.js';
import { db } from './db.js';
import { logger } from './logger.js';

let auth: ReturnType<typeof betterAuth>;

try {
  const adapter = drizzleAdapter(db as any, {
    provider: 'pg',
    schema: schema as any,
  });

  auth = betterAuth({
    database: adapter,
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: { enabled: true },
    trustedOrigins: ['http://localhost:3000'],
  } as BetterAuthOptions);
} catch (e: any) {
  logger.error({ err: e }, 'Failed to initialize Better Auth');
  throw e;
}

export { auth };
