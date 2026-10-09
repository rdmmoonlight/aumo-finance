import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { auth } from "../lib/auth.js";
import type { AppEnv } from "../types/app.types.js";

export const authRoute = new OpenAPIHono<AppEnv>();

// 1. Skema / Schema OpenAPI untuk Session Check
const SessionResponseSchema = z.object({
  user: z
    .object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      image: z.string().nullable().optional(),
      createdAt: z.string().or(z.date()),
      updatedAt: z.string().or(z.date()),
    })
    .nullable(),
  session: z
    .object({
      id: z.string(),
      userId: z.string(),
      expiresAt: z.string().or(z.date()),
      token: z.string(),
    })
    .nullable(),
});

// 2. Definisi Route OpenAPI
const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  summary: "Get Active Session / User Profile",
  description: "Mengambil data user dan session aktif dari Better Auth",
  tags: ["Auth"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: SessionResponseSchema,
          }),
        },
      },
      description: "Data session pengguna berhasil didapatkan",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
      description: "Unauthorized / Belum Login",
    },
  },
});

// 3. Implementation Handler
authRoute.openapi(getMeRoute, async (c) => {
  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!sessionData) {
    return c.json(
      {
        success: false,
        message: "Unauthorized: Silakan login terlebih dahulu",
      },
      401
    );
  }

  return c.json(
    {
      success: true,
      data: sessionData,
    },
    200
  );
});