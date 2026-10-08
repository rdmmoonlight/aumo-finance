import bcrypt from 'bcrypt';
import { and, eq, or } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import * as schema from '../db/schema.js';
import { db } from '../lib/db.js';
import { env } from '../lib/env.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { guardianService } from './guardian.service.js';

// Types - sesuaikan dengan src/types/auth.type.ts
import type { AuthResponseDto, GoogleLoginRequest, LoginRequest, UserProfile } from '../types/auth.type.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// Cookie Helper
const AUTH_COOKIE = 'access_token';
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 hari

function setAuthCookie(c: Context<AppEnv>, token: string): void {
    setCookie(c, AUTH_COOKIE, token, {
        httpOnly: true,
        path: '/',
        maxAge: AUTH_COOKIE_MAX_AGE,
        sameSite: 'Lax',
        secure: env.NODE_ENV === 'production',
    });
}

export class AuthService {
    // Equivalent C#: IValidator<LoginRequest> -> kita pakai Zod di route layer
    // Jadi ValidateLoginAsync tidak perlu di service, tapi kita sediakan helper

    async validateLoginPayload(request: LoginRequest) {
        // Validasi ringan, yang berat pakai zod di route
        if (!request.email || !request.password) {
            return { isValid: false, errors: ['Email dan password wajib'] };
        }
        return { isValid: true };
    }

    async processLogin(
        request: LoginRequest,
        ipAddress: string,
        headerUserAgent: string
    ): Promise<AuthResponseDto | null> {
        // C# : _userManager.FindByEmailAsync || FindByNameAsync
        const identifier = request.email.toLowerCase().trim();

        const user = await db.query.users.findFirst({
            where: or(
                eq(schema.users.email, identifier),
                eq(schema.users.userName, identifier)
            ),
            with: {
                roles: { with: { role: true } },
                claims: true
            }
        });

        if (!user) return null;

        const safeUserAgent = request.userAgent?.trim()
            || headerUserAgent?.trim()
            || 'Aumo Client';

        const isMobile = request.isMobileClient ?? false;
        const deviceCategory = isMobile ? 'Mobile' : 'Web';
        const osValue = request.operatingSystem?.trim() || deviceCategory;

        // C# : IsLockedOutAsync
        if (user.lockoutEnd && new Date(user.lockoutEnd) > new Date()) {
            return {
                success: false,
                message: 'LOCKED_OUT',
            };
        }

        // C# : CheckPasswordSignInAsync
        const isPasswordValid = await bcrypt.compare(request.password, user.passwordHash);

        if (!isPasswordValid) {
            // Increment failed count - C# lockoutOnFailure: true
            const newFailedCount = (user.accessFailedCount || 0) + 1;
            const shouldLockout = newFailedCount >= 5;

            await db.update(schema.users).set({
                accessFailedCount: newFailedCount,
                lockoutEnd: shouldLockout ? new Date(Date.now() + 15 * 60 * 1000) : null, // 15 menit
                updatedAt: new Date()
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
                userAgent: safeUserAgent
            });

            if (shouldLockout) {
                return { success: false, message: 'LOCKED_OUT' };
            }

            return null;
        }

        // Sukses - reset failed count
        await db.update(schema.users).set({
            accessFailedCount: 0,
            lockoutEnd: null,
            lastLoginAt: new Date()
        }).where(eq(schema.users.id, user.id));

        let jwtToken: string | undefined;

        // C# : isMobile ? GenerateJwt : SignInAsync (cookie)
        // Di custom framework, cookie di-set di route layer
        if (isMobile) {
            jwtToken = await this.generateJwtToken(user);
        }

        // C# : _guardianService.CreateSessionAsync
        await guardianService.createSession({
            userId: user.id,
            deviceName: deviceCategory,
            os: osValue,
            browser: isMobile ? 'Mobile App' : 'Web Browser',
            ipAddress,
            country: 'ID',
            sessionType: isMobile ? 'JWT_BEARER' : 'COOKIE_SESSION',
            userAgent: safeUserAgent
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
            userAgent: safeUserAgent
        });

        logger.info({ userId: user.id, deviceCategory }, 'Login success');

        return {
            success: true,
            message: isMobile ? 'Mobile login successful.' : 'Web login successful.',
            userId: user.id,
            fullName: user.fullName || user.userName || 'User',
            avatarUrl: user.avatarUrl || null,
            token: jwtToken
        };
    }

    async processGoogleLogin(request: GoogleLoginRequest): Promise<AuthResponseDto | null> {
        if (!request.idToken) return null;

        let payload: any;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: request.idToken,
                audience: env.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
            if (!payload) return null;
        } catch (err) {
            logger.warn({ err }, 'Google ID token invalid');
            return null;
        }

        const provider = 'Google';
        const providerKey = payload.sub;

        // C# : FindByLoginAsync
        const existingLogin = await db.query.userLogins.findFirst({
            where: and(
                eq(schema.userLogins.loginProvider, provider),
                eq(schema.userLogins.providerKey, providerKey)
            ),
            with: { user: { with: { roles: { with: { role: true } } } } }
        });

        let user = existingLogin?.user;

        if (!user) {
            // C# : FindByEmailAsync
            user = await db.query.users.findFirst({
                where: eq(schema.users.email, payload.email.toLowerCase()),
                with: { roles: { with: { role: true } } }
            });

            if (!user) {
                // C# : CreateAsync new ApplicationUser
                const [newUser] = await db.insert(schema.users).values({
                    id: crypto.randomUUID(),
                    userName: payload.email,
                    email: payload.email.toLowerCase(),
                    emailConfirmed: true,
                    fullName: payload.name,
                    avatarUrl: payload.picture,
                    passwordHash: '', // Google user no password
                }).returning();

                // Add to role User
                const userRole = await db.query.roles.findFirst({
                    where: eq(schema.roles.name, 'User')
                });
                if (userRole) {
                    await db.insert(schema.userRoles).values({
                        userId: newUser.id,
                        roleId: userRole.id
                    });
                }

                user = newUser as any;
            }

            // C# : AddLoginAsync
            await db.insert(schema.userLogins).values({
                userId: user.id,
                loginProvider: provider,
                providerKey: providerKey,
                providerDisplayName: 'Google'
            });
        }

        if (!request.isMobileClient) {
            // Cookie session akan di-handle di route
            return {
                success: true,
                message: 'Google login successful (Cookie session established).',
                userId: user.id,
                fullName: user.fullName || user.userName || 'User',
                avatarUrl: user.avatarUrl || null
            };
        }

        const token = await this.generateJwtToken(user);
        return {
            success: true,
            message: 'Google login successful.',
            userId: user.id,
            fullName: user.fullName || user.userName || 'User',
            avatarUrl: user.avatarUrl || null,
            token
        };
    }

    configureGoogleRedirect(redirectUrl: string) {
        // C# : ConfigureExternalAuthenticationProperties
        // Di TS custom framework, kita return config untuk redirect
        const state = Buffer.from(JSON.stringify({ redirectUrl, ts: Date.now() })).toString('base64url');
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${env.GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
            `response_type=code&scope=openid email profile&state=${state}`;

        return {
            url: googleAuthUrl,
            state,
            properties: { redirectUrl }
        };
    }

    async processGoogleCallback(principal: any, loginProvider: string, providerKey: string): Promise<string | null> {
        // principal dari google callback = decoded profile
        // C# : ExternalLoginSignInAsync
        const existingLogin = await db.query.userLogins.findFirst({
            where: and(
                eq(schema.userLogins.loginProvider, loginProvider),
                eq(schema.userLogins.providerKey, providerKey)
            )
        });

        if (existingLogin) return null; // Sudah login, sukses

        const email = principal.email?.toLowerCase();
        if (!email) return 'Email claim not received from Google.';

        let user = await db.query.users.findFirst({
            where: eq(schema.users.email, email)
        });

        if (!user) {
            const [newUser] = await db.insert(schema.users).values({
                id: crypto.randomUUID(),
                userName: email,
                email: email,
                emailConfirmed: true,
                fullName: principal.name || email,
                avatarUrl: principal.picture || null,
                passwordHash: ''
            }).returning();

            const userRole = await db.query.roles.findFirst({
                where: eq(schema.roles.name, 'User')
            });
            if (userRole) {
                await db.insert(schema.userRoles).values({
                    userId: newUser.id,
                    roleId: userRole.id
                });
            }
            user = newUser as any;
        }

        await db.insert(schema.userLogins).values({
            userId: user.id,
            loginProvider,
            providerKey,
            providerDisplayName: loginProvider
        }).onConflictDoNothing();

        return null;
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        // C# : _userManager.GetUserAsync + GetRolesAsync + GetClaimsAsync
        // Di TS, userId didapat dari JWT / session di middleware, bukan ClaimsPrincipal
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId),
            with: {
                roles: { with: { role: true } },
                claims: true
            }
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
            customClaims: user.claims.map((c: any) => ({ type: c.claimType, value: c.claimValue }))
        };
    }

    async logout(userId?: string, sessionId?: string) {
        // C# : _signInManager.SignOutAsync
        // Di custom framework: hapus session dari DB + clear cookie di route
        if (sessionId) {
            await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
        }
        logger.info({ userId }, 'User logged out');
    }

    private async generateJwtToken(user: any): Promise<string> {
        // C# : GenerateJwtTokenAsync - sama persis logicnya
        const signingKey = env.JWT_SIGNING_KEY;
        const issuer = env.JWT_ISSUER || 'AumoFinanceApp';

        if (!signingKey) throw new AppError('JWT_SIGNING_KEY is missing', 500);

        const roles = user.roles?.map((r: any) => r.role?.name || r.name) || [];
        const claims = user.claims || [];

        const payload = {
            sub: user.id,
            name: user.fullName || user.userName || '',
            email: user.email || '',
            jti: crypto.randomUUID(),
            roles,
            // custom claims dari DB
            ...Object.fromEntries(claims.map((c: any) => [c.claimType, c.claimValue]))
        };

        return jwt.sign(payload, signingKey, {
            issuer,
            audience: issuer,
            expiresIn: '30d',
            algorithm: 'HS256'
        });
    }
}

export const authService = new AuthService();
