import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import * as schema from "../db/schema/index.js";
import { db } from "../index.js";
import { env } from "./env.js";

const isProduction = env.NODE_ENV === "production";

const trustedOrigins = Array.from(
    new Set(
        [...(env.CORS_ORIGINS?.split(",") ?? []), env.FRONTEND_URL ?? ""]
            .map((origin) => origin.trim().replace(/\/$/, ""))
            .filter(Boolean)
    )
);

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET ?? env.JWT_SIGNING_KEY,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    trustedOrigins,

    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),

    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6, // selaras dengan registerSchema
        autoSignIn: true, // sesi langsung dibuat setelah registrasi
    },

    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 hari (sama dengan cookie lama)
        updateAge: 60 * 60 * 24, // perpanjang sesi tiap 1 hari aktif
    },

    // Mobile: token sesi dari body bisa dipakai sebagai "Authorization: Bearer <token>"
    plugins: [bearer()],

    // Frontend (Vercel) dan backend beda domain -> cookie wajib SameSite=None; Secure
    advanced: {
        defaultCookieAttributes: {
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
            httpOnly: true,
        },
    },
});
