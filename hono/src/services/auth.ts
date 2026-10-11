import { z } from "zod";
import { APIError } from "better-auth/api";
import type { Context } from "hono";
import { auth } from "../lib/auth.js";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import type {
    AuthResult,
    AuthSessionDto,
    AuthUserDto,
    ChangePasswordRequest,
    LoginRequest,
    RawUser,
    RegisterDTO,
} from "../types/auth.js";

const toUserDto = (u: RawUser): AuthUserDto => ({
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    image: u.image ?? null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Menerjemahkan error Better Auth menjadi AppError dengan status 400/401/409/500
 * agar response API konsisten.
 */
function mapAuthError(err: unknown, fallbackMessage: string): AppError {
    if (err instanceof AppError) return err;

    if (err instanceof APIError) {
        const code = String((err.body as { code?: string } | undefined)?.code ?? "");
        const message = (err.body as { message?: string } | undefined)?.message ?? fallbackMessage;

        if (code.startsWith("USER_ALREADY_EXISTS")) {
            return new AppError("Email sudah terdaftar", 409);
        }
        if (code === "INVALID_EMAIL_OR_PASSWORD" || code === "INVALID_PASSWORD") {
            return new AppError("Email atau password salah", 401);
        }
        if (err.statusCode === 401 || err.statusCode === 403) {
            return new AppError(message, 401);
        }
        if (err.statusCode >= 400 && err.statusCode < 500) {
            return new AppError(message, 400);
        }
    }

    logger.error({ err }, fallbackMessage);
    return new AppError(fallbackMessage, 500);
}

export class AuthService {
    /** Mengambil session user aktif dari request Hono */
    static async getSession(c: Context) {
        return auth.api.getSession({ headers: c.req.raw.headers });
    }

    /** Cek apakah email sudah dipakai lewat Better Auth API. */
    static async isEmailRegistered(email: string, headers?: Headers): Promise<boolean> {
        try {
            const user = await auth.api.getUserByEmail({
                query: { email: normalizeEmail(email) },
                headers,
            });
            return !!user;
        } catch {
            return false;
        }
    }

    /**
     * Registrasi pengguna baru (Email & Password).
     * - Email dinormalisasi (lowercase)
     * - Nama kosong -> memakai bagian lokal email
     * - Sesi langsung dibuat (autoSignIn)
     */
    static async register(data: RegisterDTO, headers: Headers): Promise<AuthResult> {
        const email = normalizeEmail(data.email);
        const name = data.name?.trim() || email.split("@")[0];

        try {
            const { headers: resHeaders, response } = await auth.api.signUpEmail({
                body: { name, email, password: data.password },
                headers,
                returnHeaders: true,
            });

            return {
                user: toUserDto(response.user as RawUser),
                token: response.token ?? null,
                setCookies: resHeaders.getSetCookie(),
            };
        } catch (err) {
            throw mapAuthError(err, "Registrasi gagal");
        }
    }

    /** Login dengan Email & Password. */
    static async login(data: LoginRequest, headers: Headers): Promise<AuthResult> {
        try {
            const { headers: resHeaders, response } = await auth.api.signInEmail({
                body: {
                    email: normalizeEmail(data.email),
                    password: data.password,
                    rememberMe: data.rememberMe,
                },
                headers,
                returnHeaders: true,
            });

            return {
                user: toUserDto(response.user as RawUser),
                token: response.token ?? null,
                setCookies: resHeaders.getSetCookie(),
            };
        } catch (err) {
            throw mapAuthError(err, "Login gagal");
        }
    }

    /** Logout: menghapus sesi aktif dan mengembalikan header penghapus cookie. */
    static async logout(headers: Headers): Promise<string[]> {
        try {
            const { headers: resHeaders } = await auth.api.signOut({
                headers,
                returnHeaders: true,
            });
            return resHeaders.getSetCookie();
        } catch (err) {
            throw mapAuthError(err, "Logout gagal");
        }
    }

    /** Ganti password (wajib login). Opsional mencabut sesi di perangkat lain. */
    static async changePassword(
        data: ChangePasswordRequest,
        headers: Headers
    ): Promise<AuthResult> {
        try {
            const { headers: resHeaders, response } = await auth.api.changePassword({
                body: {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                    revokeOtherSessions: data.revokeOtherSessions,
                },
                headers,
                returnHeaders: true,
            });

            return {
                user: toUserDto(response.user as RawUser),
                token: response.token ?? null,
                setCookies: resHeaders.getSetCookie(),
            };
        } catch (err) {
            throw mapAuthError(err, "Gagal mengganti password");
        }
    }

    /** Daftar sesi aktif milik user. */
    static async listSessions(headers: Headers): Promise<AuthSessionDto[]> {
        try {
            const current = await auth.api.getSession({ headers });
            if (!current) throw new AppError("Unauthorized", 401);

            const rows = await auth.api.listSessions({ headers });
            return rows.map((s) => ({
                id: s.id,
                ipAddress: s.ipAddress ?? null,
                userAgent: s.userAgent ?? null,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
                isCurrent: s.id === current.session.id,
            }));
        } catch (err) {
            throw mapAuthError(err, "Gagal mengambil daftar sesi");
        }
    }

    /** Cabut satu sesi berdasarkan id. */
    static async revokeSession(userId: string, sessionId: string, headers: Headers): Promise<void> {
        try {
            await auth.api.revokeSession({ body: { id: sessionId }, headers });
        } catch (err) {
            throw mapAuthError(err, "Gagal mencabut sesi");
        }
    }

    /** Cabut seluruh sesi lain, sesi saat ini tetap aktif. */
    static async revokeOtherSessions(headers: Headers): Promise<void> {
        try {
            await auth.api.revokeOtherSessions({ headers });
        } catch (err) {
            throw mapAuthError(err, "Gagal mencabut sesi lain");
        }
    }
}
