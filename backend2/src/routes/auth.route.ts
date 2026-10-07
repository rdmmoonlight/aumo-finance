import { z } from "zod";
import { signJwt, verifyPasswordAspNet } from "../lib/auth";
import { parseJsonBody, sendJson } from "../lib/http";
import { userService } from "../services/user.service";
import type { Route } from "../types/route.types";

const registerSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    name: z.string().optional(),
    clientType: z.enum(["web", "mobile"]).optional().default("web"),
});

const loginSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
    clientType: z.enum(["web", "mobile"]).optional().default("web"),
});

export const authRoutes: Route[] = [
    // -------------------------------------------------------------------
    // POST /auth/register
    // -------------------------------------------------------------------
    {
        method: "POST",
        path: "/auth/register",
        openapi: {
            summary: "User Register",
            description: "Mendaftarkan user baru menggunakan email & password.",
            tags: ["Auth"],
            responses: {
                "201": { description: "Registrasi berhasil" },
                "400": { description: "Validasi input gagal atau email sudah terdaftar" },
            },
        },
        handler: async (req, res) => {
            const body = await parseJsonBody(req, registerSchema);

            // Cek apakah email sudah terdaftar
            const existingUser = await userService.findByEmail(body.email);
            if (existingUser) {
                return sendJson(res, 400, { message: "Email sudah terdaftar" });
            }

            // Buat user baru
            const user = await userService.createUser({
                email: body.email,
                password: body.password,
                clientType: body.clientType,
                name: body.name,
            });

            // Generate Token & Auto-login setelah registrasi
            const tokenPayload = { userId: user.id, email: user.email, role: user.role };
            const token = signJwt(tokenPayload);

            if (body.clientType === "mobile") {
                return sendJson(res, 201, {
                    message: "Registrasi berhasil",
                    token,
                    user,
                });
            }

            const isProd = process.env.NODE_ENV === "production";
            const cookieHeader = `access_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProd ? "; Secure" : ""}`;

            return sendJson(
                res,
                201,
                { message: "Registrasi berhasil", user },
                { "Set-Cookie": cookieHeader }
            );
        },
    },

    // -------------------------------------------------------------------
    // POST /auth/login
    // -------------------------------------------------------------------
    {
        method: "POST",
        path: "/auth/login",
        openapi: {
            summary: "User Login",
            description: "Login menggunakan email & password.",
            tags: ["Auth"],
            responses: {
                "200": { description: "Login berhasil" },
                "400": { description: "Validasi input gagal" },
                "401": { description: "Email atau password salah" },
            },
        },
        handler: async (req, res) => {
            const body = await parseJsonBody(req, loginSchema);

            const user = await userService.findByEmail(body.email);
            if (!user || !verifyPasswordAspNet(body.password, user.passwordHash)) {
                return sendJson(res, 401, { message: "Email atau password salah" });
            }

            const tokenPayload = { userId: user.id, email: user.email, role: user.role };
            const token = signJwt(tokenPayload);

            if (body.clientType === "mobile") {
                return sendJson(res, 200, {
                    message: "Login berhasil",
                    token,
                    user: tokenPayload,
                });
            }

            const isProd = process.env.NODE_ENV === "production";
            const cookieHeader = `access_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProd ? "; Secure" : ""}`;

            return sendJson(
                res,
                200,
                { message: "Login berhasil", user: tokenPayload },
                { "Set-Cookie": cookieHeader }
            );
        },
    },

    // -------------------------------------------------------------------
    // POST /auth/logout
    // -------------------------------------------------------------------
    {
        method: "POST",
        path: "/auth/logout",
        openapi: {
            summary: "User Logout",
            description: "Menghapus cookie autentikasi web.",
            tags: ["Auth"],
            responses: {
                "200": { description: "Logout berhasil" },
            },
        },
        handler: async (_req, res) => {
            const clearCookie = "access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax";
            return sendJson(
                res,
                200,
                { message: "Logout berhasil" },
                { "Set-Cookie": clearCookie }
            );
        },
    },

    // -------------------------------------------------------------------
    // GET /auth/google/callback
    // -------------------------------------------------------------------
    {
        method: "GET",
        path: "/auth/google/callback",
        openapi: {
            summary: "Google OAuth Callback",
            description: "Callback handler setelah autentikasi Google.",
            tags: ["Auth"],
            responses: {
                "302": { description: "Redirect ke frontend" },
                "400": { description: "Authorization code missing" },
            },
        },
        handler: async (req, res) => {
            try {
                const host = req.headers.host || "localhost";
                const url = new URL(req.url || "", `http://${host}`);
                const code = url.searchParams.get("code");

                if (!code) {
                    return sendJson(res, 400, { message: "Authorization code tidak ditemukan" });
                }

                const user = await userService.findOrCreateGoogleUser({
                    email: "user@gmail.com",
                    name: "Google User",
                    googleId: "123456789",
                });

                const token = signJwt({ userId: user.id, email: user.email, role: user.role });

                const isProd = process.env.NODE_ENV === "production";
                const cookieHeader = `access_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProd ? "; Secure" : ""}`;

                const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
                res.writeHead(302, {
                    Location: `${frontendUrl}/dashboard?token=${token}`,
                    "Set-Cookie": cookieHeader,
                });
                return res.end();
            } catch {
                return sendJson(res, 500, { message: "Gagal autentikasi Google OAuth" });
            }
        },
    },
];