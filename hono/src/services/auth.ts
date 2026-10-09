import { auth } from "@/lib/auth"; // Instance Better Auth Anda
import type { Context } from "hono";

export class AuthService {
    /**
     * Mengambil session user aktif dari request Hono
     */
    static async getSession(c: Context) {
        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        });
        return session;
    }

    /**
     * Mendaftarkan pengguna baru (Email & Password)
     */
    static async signUpWithEmail(data: {
        email: string;
        password: string;
        name: string;
    }) {
        return await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
            },
        });
    }

    /**
     * Login pengguna menggunakan Email & Password
     */
    static async signInWithEmail(data: { email: string; password: string }) {
        return await auth.api.signInEmail({
            body: {
                email: data.email,
                password: data.password,
            },
        });
    }

    /**
     * Logout pengguna (Menghapus Session)
     */
    static async signOut(c: Context) {
        return await auth.api.signOut({
            headers: c.req.raw.headers,
        });
    }
}