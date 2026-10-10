import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import { env } from "../lib/env.js";
import { AppError } from "../lib/errors.js";
import { rateLimit } from "../middlewares/rate-limit.js";
import { AuthService, type AuthResult } from "../services/auth.js";
import type { AppEnv } from "../types/app.types.js";
import {
  changePasswordSchema,
  checkEmailQuerySchema,
  loginRequestSchema,
  registerSchema,
} from "../types/auth.js";

// Format error validasi seragam: { success:false, message, errors }
export const authRoute = new OpenAPIHono<AppEnv>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false as const,
          message: "Validasi gagal",
          errors: z.flattenError(result.error).fieldErrors,
        },
        400
      );
    }
  },
});

// Pembatas khusus endpoint sensitif (lebih ketat dari limit global)
const strictLimit = rateLimit({
  scope: "auth",
  max: env.AUTH_RATE_LIMIT_MAX,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
});
authRoute.use("/register", strictLimit);
authRoute.use("/login", strictLimit);
authRoute.use("/change-password", strictLimit);

// ==========================================
// Skema respons OpenAPI
// ==========================================
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

const AuthSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  userId: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().nullable(),
  user: UserSchema,
  token: z.string().optional(), // hanya untuk clientType "mobile"
});

const ErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

const MessageSchema = z.object({ success: z.literal(true), message: z.string() });

const json = <T extends z.ZodType>(schema: T, description: string) => ({
  content: { "application/json": { schema } },
  description,
});

const errorResponses = {
  400: json(ErrorSchema, "Request tidak valid"),
  401: json(ErrorSchema, "Belum login / kredensial salah"),
  409: json(ErrorSchema, "Data sudah ada"),
  500: json(ErrorSchema, "Kesalahan server"),
};

// ==========================================
// Helper
// ==========================================
function fail(c: Context, err: unknown) {
  const status = err instanceof AppError ? err.statusCode : 500;
  const code = (status === 400 || status === 401 || status === 409 ? status : 500) as
    | 400
    | 401
    | 409
    | 500;
  const message = err instanceof AppError ? err.message : "Terjadi kesalahan pada server";
  return c.json({ success: false as const, message }, code);
}

/** Teruskan cookie sesi Better Auth ke browser (web). */
function applyCookies(c: Context, cookies: string[]) {
  for (const cookie of cookies) c.header("Set-Cookie", cookie, { append: true });
}

function authBody(result: AuthResult, message: string, isMobile: boolean) {
  return {
    success: true as const,
    message,
    userId: result.user.id,
    fullName: result.user.name,
    avatarUrl: result.user.image,
    user: result.user,
    // Web memakai cookie httpOnly; token hanya diberikan ke client mobile
    ...(isMobile && result.token ? { token: result.token } : {}),
  };
}

// ==========================================
// POST /register
// ==========================================
const registerRoute = createRoute({
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
    201: json(AuthSuccessSchema, "Registrasi berhasil"),
    ...errorResponses,
  },
});

authRoute.openapi(registerRoute, async (c) => {
  const body = c.req.valid("json");
  try {
    const result = await AuthService.register(body, c.req.raw.headers);
    applyCookies(c, result.setCookies);
    return c.json(
      authBody(result, "Registrasi berhasil", body.clientType === "mobile"),
      201
    );
  } catch (err) {
    return fail(c, err);
  }
});

// ==========================================
// GET /check-email
// ==========================================
const checkEmailRoute = createRoute({
  method: "get",
  path: "/check-email",
  summary: "Cek ketersediaan email",
  tags: ["Auth"],
  request: { query: checkEmailQuerySchema },
  responses: {
    200: json(
      z.object({ success: z.literal(true), email: z.string(), available: z.boolean() }),
      "Hasil pengecekan"
    ),
    ...errorResponses,
  },
});

authRoute.openapi(checkEmailRoute, async (c) => {
  const { email } = c.req.valid("query");
  try {
    const registered = await AuthService.isEmailRegistered(email);
    return c.json(
      { success: true as const, email: email.toLowerCase(), available: !registered },
      200
    );
  } catch (err) {
    return fail(c, err);
  }
});

// ==========================================
// POST /login
// ==========================================
const loginRoute = createRoute({
  method: "post",
  path: "/login",
  summary: "Login email & password",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: loginRequestSchema } }, required: true },
  },
  responses: {
    200: json(AuthSuccessSchema, "Login berhasil"),
    ...errorResponses,
  },
});

authRoute.openapi(loginRoute, async (c) => {
  const body = c.req.valid("json");
  try {
    const result = await AuthService.login(body, c.req.raw.headers);
    applyCookies(c, result.setCookies);
    const isMobile = body.clientType === "mobile" || body.isMobileClient;
    return c.json(authBody(result, "Login berhasil", isMobile), 200);
  } catch (err) {
    return fail(c, err);
  }
});

// ==========================================
// POST /logout
// ==========================================
const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  summary: "Logout (hapus sesi aktif)",
  tags: ["Auth"],
  responses: {
    200: json(MessageSchema, "Logout berhasil"),
    ...errorResponses,
  },
});

authRoute.openapi(logoutRoute, async (c) => {
  try {
    const cookies = await AuthService.logout(c.req.raw.headers);
    applyCookies(c, cookies);
    return c.json({ success: true as const, message: "Logout berhasil" }, 200);
  } catch (err) {
    return fail(c, err);
  }
});

// ==========================================
// GET /me
// ==========================================
const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  summary: "Get Active Session / User Profile",
  description: "Mengambil data user dan session aktif dari Better Auth",
  tags: ["Auth"],
  responses: {
    200: json(
      z.object({
        success: z.boolean(),
        data: z.object({
          user: UserSchema.extend({ image: z.string().nullish() }).passthrough().nullable(),
          session: z
            .object({
              id: z.string(),
              userId: z.string(),
              expiresAt: z.string().or(z.date()),
              token: z.string(),
            })
            .passthrough()
            .nullable(),
        }),
      }),
      "Data session pengguna berhasil didapatkan"
    ),
    401: json(ErrorSchema, "Unauthorized / Belum Login"),
  },
});

authRoute.openapi(getMeRoute, async (c) => {
  const sessionData = await AuthService.getSession(c);

  if (!sessionData) {
    return c.json(
      { success: false as const, message: "Unauthorized: Silakan login terlebih dahulu" },
      401
    );
  }

  return c.json({ success: true, data: sessionData }, 200);
});

// ==========================================
// POST /change-password
// ==========================================
const changePasswordRoute = createRoute({
  method: "post",
  path: "/change-password",
  summary: "Ganti password (wajib login)",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: changePasswordSchema } }, required: true },
  },
  responses: {
    200: json(MessageSchema, "Password berhasil diganti"),
    ...errorResponses,
  },
});

authRoute.openapi(changePasswordRoute, async (c) => {
  const body = c.req.valid("json");
  try {
    const result = await AuthService.changePassword(body, c.req.raw.headers);
    applyCookies(c, result.setCookies);
    return c.json({ success: true as const, message: "Password berhasil diganti" }, 200);
  } catch (err) {
    return fail(c, err);
  }
});

// ==========================================
// GET /sessions  |  DELETE /sessions  |  DELETE /sessions/:id
// ==========================================
const sessionsRoute = createRoute({
  method: "get",
  path: "/sessions",
  summary: "Daftar sesi/perangkat aktif",
  tags: ["Auth"],
  responses: {
    200: json(
      z.object({
        success: z.literal(true),
        data: z.array(
          z.object({
            id: z.string(),
            ipAddress: z.string().nullable(),
            userAgent: z.string().nullable(),
            createdAt: z.string().or(z.date()),
            expiresAt: z.string().or(z.date()),
            isCurrent: z.boolean(),
          })
        ),
      }),
      "Daftar sesi aktif"
    ),
    ...errorResponses,
  },
});

authRoute.openapi(sessionsRoute, async (c) => {
  try {
    const data = await AuthService.listSessions(c.req.raw.headers);
    return c.json({ success: true as const, data }, 200);
  } catch (err) {
    return fail(c, err);
  }
});

const revokeOthersRoute = createRoute({
  method: "delete",
  path: "/sessions",
  summary: "Cabut semua sesi lain (sesi ini tetap aktif)",
  tags: ["Auth"],
  responses: {
    200: json(MessageSchema, "Sesi lain dicabut"),
    ...errorResponses,
  },
});

authRoute.openapi(revokeOthersRoute, async (c) => {
  try {
    await AuthService.revokeOtherSessions(c.req.raw.headers);
    return c.json({ success: true as const, message: "Sesi lain berhasil dicabut" }, 200);
  } catch (err) {
    return fail(c, err);
  }
});

const revokeOneRoute = createRoute({
  method: "delete",
  path: "/sessions/{id}",
  summary: "Cabut satu sesi berdasarkan id",
  tags: ["Auth"],
  request: { params: z.object({ id: z.string().min(1) }) },
  responses: {
    200: json(MessageSchema, "Sesi dicabut"),
    ...errorResponses,
  },
});

authRoute.openapi(revokeOneRoute, async (c) => {
  const { id } = c.req.valid("param");
  try {
    const current = await AuthService.getSession(c);
    if (!current) throw new AppError("Unauthorized: Silakan login terlebih dahulu", 401);

    await AuthService.revokeSession(current.user.id, id, c.req.raw.headers);
    return c.json({ success: true as const, message: "Sesi berhasil dicabut" }, 200);
  } catch (err) {
    return fail(c, err);
  }
});
