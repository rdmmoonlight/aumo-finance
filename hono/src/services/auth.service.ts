import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import * as schema from '../';
import { db } from '../lib/db.js';
import { env } from '../lib/env.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import type { JwtPayload } from '../types/auth.type.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export class AuthService {
    configureGoogleRedirect(redirectUrl: string) {
        const allowed = (env.CORS_ORIGINS || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        if (allowed.length > 0) {
            const url = new URL(redirectUrl);
            if (!allowed.includes(url.origin)) {
                throw new AppError('Redirect URL not allowed', 400);
            }
        }

        const state = Buffer.from(
            JSON.stringify({ redirectUrl, ts: Date.now() })
        ).toString('base64url');

        const googleAuthUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${env.GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
            `response_type=code&scope=openid email profile&state=${state}`;

        return { url: googleAuthUrl, state, properties: { redirectUrl } };
    }

    async processGoogleCallback(
        principal: any,
        providerId: string,
        accountId: string
    ): Promise<string | null> {
        const email = principal.email?.toLowerCase();
        if (!email) return 'Email claim not received from Google.';

        let user = await db.query.user.findFirst({
            where: eq(schema.user.email, email),
        });

        if (!user) {
            const [newUser] = await db
                .insert(schema.user)
                .values({
                    id: crypto.randomUUID(),
                    name: principal.name || email,
                    email,
                    emailVerified: true,
                    image: principal.picture || null,
                })
                .returning();
            user = newUser;
        }

        await db
            .insert(schema.account)
            .values({
                id: crypto.randomUUID(),
                accountId,
                providerId,
                userId: user.id,
            })
            .onConflictDoNothing();

        return null;
    }

    async getUserProfile(userId: string) {
        const user = await db.query.user.findFirst({
            where: eq(schema.user.id, userId),
        });

        if (!user) return null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async logout(_userId?: string, sessionId?: string) {
        if (sessionId) {
            await db.delete(schema.session).where(eq(schema.session.id, sessionId));
        }
        logger.info({ _userId, sessionId }, 'User logged out');
    }

    public generateJwtToken(user: {
        id: string;
        name: string;
        email: string;
        emailVerified?: boolean;
        image?: string | null;
    }): string {
        const payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
            sub: user.id,
            name: user.name || '',
            email: user.email || '',
            jti: crypto.randomUUID(),
        };

        return signJwt(payload, '30d');
    }
}

export const authService = new AuthService();