import { and, eq, or } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import { GoogleLoginRequest, LoginRequest } from '../db/auth.schema.js';
import * as schema from '../db/schema.js';
import { signJwt, verifyPassword } from '../lib/auth.js';
import { db } from '../lib/db.js';
import { env } from '../lib/env.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import type { AuthResponseDto, JwtPayload, UserProfile } from '../types/auth.type.js';
import { guardianService } from './guardian.service.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export class AuthService {
    async validateLoginPayload(request: LoginRequest) {
        if (!request.email?.trim() || !request.password) {
            return { isValid: false, errors: ['Email dan password wajib'] };
        }
        return { isValid: true, errors: [] as string[] };
    }

    async processLogin(
        request: LoginRequest,
        ipAddress: string,
        headerUserAgent: string
    ): Promise<AuthResponseDto | null> {
        const identifier = request.email.toLowerCase().trim();

        const user = await db.query.users.findFirst({
            where: or(eq(schema.users.email, identifier), eq(schema.users.userName, identifier)),
            with: { roles: { with: { role: true } }, claims: true },
        });

        if (!user) return null;

        if (user.lockoutEnd && new Date(user.lockoutEnd) > new Date()) {
            return { success: false, message: 'LOCKED_OUT' };
        }

        const safeUserAgent = request.userAgent?.trim() || headerUserAgent?.trim() || 'Aumo Client';
        const isMobile = request.isMobileClient ?? false;
        const deviceCategory = isMobile ? 'Mobile' : 'Web';
        const osValue = request.operatingSystem?.trim() || deviceCategory;

        const isPasswordValid = await verifyPassword(request.password, user.passwordHash);

        if (!isPasswordValid) {
            const newFailedCount = (user.accessFailedCount || 0) + 1;
            const shouldLockout = newFailedCount >= 5;

            await db.update(schema.users).set({
                accessFailedCount: newFailedCount,
                lockoutEnd: shouldLockout ? new Date(Date.now() + 15 * 60 * 1000) : null,
                updatedAt: new Date(),
            }).where(eq(schema.users.id, user.id));

            await guardianService.createLoginActivity({
                userId: user.id,
                activity: shouldLockout ? 'Locked Out Login Attempt' : 'Failed Login',
                deviceName: deviceCategory,
                browser: isMobile ? 'Mobile App' : 'Web Browser',
                ipAddress,
                country: 'ID',
                success: false,
                os: osValue,
                userAgent: safeUserAgent,
            });

            return shouldLockout ? { success: false, message: 'LOCKED_OUT' } : null;
        }

        await db.update(schema.users).set({
            accessFailedCount: 0,
            lockoutEnd: null,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(schema.users.id, user.id));

        const jwtToken = isMobile ? this.generateJwtToken(user) : undefined;

        await guardianService.createSession({
            userId: user.id,
            deviceName: deviceCategory,
            os: osValue,
            browser: isMobile ? 'Mobile App' : 'Web Browser',
            ipAddress,
            country: 'ID',
            sessionType: isMobile ? 'JWT_BEARER' : 'COOKIE_SESSION',
            userAgent: safeUserAgent,
        });

        await guardianService.createLoginActivity({
            userId: user.id,
            activity: 'Interactive Login',
            deviceName: deviceCategory,
            browser: isMobile ? 'Mobile App' : 'Web Browser',
            ipAddress,
            country: 'ID',
            success: true,
            os: osValue,
            userAgent: safeUserAgent,
        });

        logger.info({ userId: user.id, deviceCategory }, 'Login success');

        return {
            success: true,
            message: isMobile ? 'Mobile login successful.' : 'Web login successful.',
            userId: user.id,
            fullName: user.fullName || user.userName || 'User',
            avatarUrl: user.avatarUrl || null,
            token: jwtToken,
        };
    }

    async processGoogleLogin(request: GoogleLoginRequest): Promise<AuthResponseDto | null> {
        if (!request.idToken) return null;

        let payload: any;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: request.idToken,
                audience: env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
            if (!payload || !payload.email_verified) return null;
        } catch (err) {
            logger.warn({ err }, 'Google ID token invalid');
            return null;
        }

        const provider = 'Google';
        const providerKey = payload.sub;
        const email = payload.email.toLowerCase();

        const existingLogin = await db.query.userLogins.findFirst({
            where: and(eq(schema.userLogins.loginProvider, provider), eq(schema.userLogins.providerKey, providerKey)),
            with: { user: { with: { roles: { with: { role: true } }, claims: true } } },
        });

        let user = existingLogin?.user;

        if (!user) {
            user = await db.query.users.findFirst({
                where: eq(schema.users.email, email),
                with: { roles: { with: { role: true } }, claims: true },
            });

            if (!user) {
                const newUserId = crypto.randomUUID();
                const [newUser] = await db.insert(schema.users).values({
                    id: newUserId,
                    userName: email,
                    email,
                    emailConfirmed: true,
                    fullName: payload.name || email,
                    avatarUrl: payload.picture || null,
                    passwordHash: crypto.randomUUID(), // no password, random placeholder
                }).returning();

                const userRole = await db.query.roles.findFirst({ where: eq(schema.roles.name, 'User') });
                if (userRole) {
                    await db.insert(schema.userRoles).values({ userId: newUser.id, roleId: userRole.id });
                }
                user = { ...newUser, roles: userRole ? [{ role: userRole }] : [], claims: [] } as any;
            }

            await db.insert(schema.userLogins).values({
                userId: user.id,
                loginProvider: provider,
                providerKey,
                providerDisplayName: 'Google',
            }).onConflictDoNothing();
        }

        const token = request.isMobileClient ? this.generateJwtToken(user) : undefined;

        return {
            success: true,
            message: request.isMobileClient ? 'Google login successful.' : 'Google login successful (Cookie session).',
            userId: user.id,
            fullName: user.fullName || user.userName || 'User',
            avatarUrl: user.avatarUrl || null,
            token,
        };
    }

    configureGoogleRedirect(redirectUrl: string) {
        // Basic allowlist check
        const allowed = (env.ALLOWED_REDIRECT_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (allowed.length > 0) {
            const url = new URL(redirectUrl);
            if (!allowed.includes(url.origin)) throw new AppError('Redirect URL not allowed', 400);
        }

        const state = Buffer.from(JSON.stringify({ redirectUrl, ts: Date.now() })).toString('base64url');
        const googleAuthUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${env.GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
            `response_type=code&scope=openid email profile&state=${state}`;

        return { url: googleAuthUrl, state, properties: { redirectUrl } };
    }

    async processGoogleCallback(principal: any, loginProvider: string, providerKey: string): Promise<string | null> {
        const existing = await db.query.userLogins.findFirst({
            where: and(eq(schema.userLogins.loginProvider, loginProvider), eq(schema.userLogins.providerKey, providerKey)),
        });
        if (existing) return null;

        const email = principal.email?.toLowerCase();
        if (!email) return 'Email claim not received from Google.';

        let user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });

        if (!user) {
            const [newUser] = await db.insert(schema.users).values({
                id: crypto.randomUUID(),
                userName: email,
                email,
                emailConfirmed: true,
                fullName: principal.name || email,
                avatarUrl: principal.picture || null,
                passwordHash: crypto.randomUUID(),
            }).returning();
            const userRole = await db.query.roles.findFirst({ where: eq(schema.roles.name, 'User') });
            if (userRole) await db.insert(schema.userRoles).values({ userId: newUser.id, roleId: userRole.id });
            user = newUser;
        }

        await db.insert(schema.userLogins).values({
            userId: user.id,
            loginProvider,
            providerKey,
            providerDisplayName: loginProvider,
        }).onConflictDoNothing();

        return null;
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId),
            with: { roles: { with: { role: true } }, claims: true },
        });
        if (!user) return null;

        return {
            id: user.id,
            userId: user.id,
            email: user.email,
            userName: user.userName,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            roles: user.roles.map((ur: any) => ur.role.name),
            customClaims: user.claims.map((c: any) => ({ type: c.claimType, value: c.claimValue })),
        };
    }

    async logout(_userId?: string, sessionId?: string) {
        if (sessionId) {
            await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
        }
        logger.info({ _userId, sessionId }, 'User logged out');
    }

    public generateJwtToken(user: any): string {
        const roles = user.roles?.map((r: any) => r.role?.name || r.name).filter(Boolean) || [];
        const claims = user.claims || [];

        const payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
            sub: user.id,
            name: user.fullName || user.userName || '',
            email: user.email || '',
            jti: crypto.randomUUID(),
            roles,
            ...Object.fromEntries(claims.map((c: any) => [c.claimType, c.claimValue])),
        };

        return signJwt(payload, '30d');
    }
}

export const authService = new AuthService();