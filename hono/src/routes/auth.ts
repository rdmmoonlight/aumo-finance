import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { user as userTable, session as sessionTable } from "../db/schema/index.js";
import type { AppEnv } from "../types/app.types.js";
import {
  changePasswordSchema,
  checkEmailQuerySchema,
  loginRequestSchema,
  registerSchema,
} from "../types/auth.js";

export const authRoute = new OpenAPIHono<AppEnv>();

// ==========================================
// Skema Respons dari Database Schema Drizzle
// ==========================================
export const UserSchema = createSelectSchema(userTable);

export const SessionSchema = createSelectSchema(sessionTable);

// ==========================================
// Definitions & Route Mapping
// ==========================================

// POST /register
export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  summary: "Registrasi pengguna baru",
  description:
    "Mendaftarkan user (email & password) ke tabel user/account. Sesi langsung dibuat: web menerima cookie, mobile menerima token.",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: registerSchema } }, required: true },
  },
  responses: {
    201: { description: "Registrasi berhasil" },
    400: { description: "Request tidak valid" },
    409: { description: "Data sudah ada" },
    500: { description: "Kesalahan server" },
  },
});

// GET /check-email
export const checkEmailRoute = createRoute({
  method: "get",
  path: "/check-email",
  summary: "Cek ketersediaan email",
  tags: ["Auth"],
  request: { query: checkEmailQuerySchema },
  responses: {
    200: { description: "Hasil pengecekan" },
    400: { description: "Request tidak valid" },
    500: { description: "Kesalahan server" },
  },
});

// POST /login
export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  summary: "Login email & password",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: loginRequestSchema } }, required: true },
  },
  responses: {
    200: { description: "Login berhasil" },
    400: { description: "Request tidak valid" },
    401: { description: "Belum login / kredensial salah" },
    500: { description: "Kesalahan server" },
  },
});

// POST /logout
export const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  summary: "Logout (hapus sesi aktif)",
  tags: ["Auth"],
  responses: {
    200: { description: "Logout berhasil" },
    401: { description: "Belum login" },
    500: { description: "Kesalahan server" },
  },
});

// GET /me
export const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  summary: "Get Active Session / User Profile",
  description: "Mengambil data user dan session aktif dari Better Auth",
  tags: ["Auth"],
  responses: {
    200: { description: "Data session pengguna berhasil didapatkan" },
    401: { description: "Unauthorized / Belum Login" },
  },
});

// POST /change-password
export const changePasswordRoute = createRoute({
  method: "post",
  path: "/change-password",
  summary: "Ganti password (wajib login)",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: changePasswordSchema } }, required: true },
  },
  responses: {
    200: { description: "Password berhasil diganti" },
    400: { description: "Request tidak valid" },
    401: { description: "Belum login" },
    500: { description: "Kesalahan server" },
  },
});

// GET /sessions
export const sessionsRoute = createRoute({
  method: "get",
  path: "/sessions",
  summary: "Daftar sesi/perangkat aktif",
  tags: ["Auth"],
  responses: {
    200: { description: "Daftar sesi aktif" },
    401: { description: "Belum login" },
    500: { description: "Kesalahan server" },
  },
});

// DELETE /sessions
export const revokeOthersRoute = createRoute({
  method: "delete",
  path: "/sessions",
  summary: "Cabut semua sesi lain (sesi ini tetap aktif)",
  tags: ["Auth"],
  responses: {
    200: { description: "Sesi lain dicabut" },
    401: { description: "Belum login" },
    500: { description: "Kesalahan server" },
  },
});

// DELETE /sessions/:id
export const revokeOneRoute = createRoute({
  method: "delete",
  path: "/sessions/{id}",
  summary: "Cabut satu sesi berdasarkan id",
  tags: ["Auth"],
  responses: {
    200: { description: "Sesi dicabut" },
    401: { description: "Belum login" },
    500: { description: "Kesalahan server" },
  },
});
