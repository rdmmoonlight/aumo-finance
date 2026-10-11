import { z } from "zod";

// Skema validasi request auth. Diletakkan di src/db/schema (sumber kebenaran skema).
// Sengaja tidak di-export dari index.ts agar tidak ikut masuk ke adapter Drizzle.

// Aturan password bersama (register & ganti password)
export const passwordRule = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .max(128, "Password maksimal 128 karakter")
  .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
  .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung minimal 1 angka");

export const registerSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: passwordRule,
  name: z.string().trim().min(2, "Nama minimal 2 karakter").optional().or(z.literal("")),
  clientType: z.enum(["web", "mobile"]).optional().default("web"),
});

export const loginRequestSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  rememberMe: z.boolean().optional().default(false),
  isMobileClient: z.boolean().optional().default(false),
  userAgent: z.string().optional(),
  operatingSystem: z.string().optional(),
  clientType: z.enum(["web", "mobile"]).optional().default("web"),
});

export const checkEmailQuerySchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: passwordRule,
  revokeOtherSessions: z.boolean().optional().default(true),
});
