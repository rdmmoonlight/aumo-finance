import { APIError } from "better-auth/api";
import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { session as sessionTable, user as userTable } from "../db/schema/index.js";
import { db } from "../index.js";
import { auth } from "../lib/auth.js";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import type {
    AuthSessionDto,
    AuthUserDto,
    ChangePasswordRequest,
    LoginRequest,
    RegisterDTO,
} from "../types/auth.js";

/** Hasil operasi auth: data + header Set-Cookie dari Better Auth (untuk web). */
export interface AuthResult {
    user: AuthUserDto;
    /** Token sesi (hanya diteruskan ke client mobile). */
    token: string | null;
    setCookies: string[];
}

type RawUser = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
};

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

    /** Cek apakah email sudah dipakai (tabel "user"). */
    static async isEmailRegistered(email: string): Promise<boolean> {
        const rows = await db
            .select({ id: userTable.id })
            .from(userTable)
            .where(eq(userTable.email, normalizeEmail(email)))
            .limit(1);
        return rows.length > 0;
    }

    /**
     * Registrasi pengguna baru (Email & Password).
     * - Email dinormalisasi (lowercase) dan dicek duplikat lebih dulu
     * - Nama kosong -> memakai bagian lokal email
     * - Password di-hash oleh Better Auth (tabel "account", providerId "credential")
     * - Sesi langsung dibuat (autoSignIn) sehingga user tidak perlu login ulang
     */
    static async register(data: RegisterDTO, headers: Headers): Promise<AuthResult> {
        const email = normalizeEmail(data.email);

        if (await this.isEmailRegistered(email)) {
            throw new AppError("Email sudah terdaftar", 409);
        }

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

    /** Daftar sesi aktif milik user (tanpa token). */
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

    /** Cabut satu sesi berdasarkan id (hanya sesi milik user yang sedang login). */
    static async revokeSession(userId: string, sessionId: string, headers: Headers): Promise<void> {
        const rows = await db
            .select({ token: sessionTable.token })
            .from(sessionTable)
            .where(and(eq(sessionTable.id, sessionId), eq(sessionTable.userId, userId)))
            .limit(1);

        if (rows.length === 0) throw new AppError("Sesi tidak ditemukan", 400);

        try {
            await auth.api.revokeSession({ body: { token: rows[0].token }, headers });
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
