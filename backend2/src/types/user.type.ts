import { z } from "zod";

// ==========================================
// 1. Roles & Enums
// ==========================================
export type UserRole = "user" | "admin" | "superadmin";

// ==========================================
// 2. Database Entity Interface (Drizzle/ORM)
// ==========================================
export interface User {
    id: string;
    email: string;
    passwordHash: string; // Format ASP.NET Identity V3 Base64
    name?: string | null;
    role: UserRole;
    googleId?: string | null;
    avatarUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ==========================================
// 3. JWT Auth Payload
// ==========================================
export interface AuthUserPayload {
    userId: string;
    email: string;
    role: UserRole;
}

// ==========================================
// 4. Zod Schemas & Inferred Types (DTOs)
// ==========================================

// Schema Login
export const loginSchema = z.object({
    email: z.string().trim().email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
    clientType: z.enum(["web", "mobile"]).optional().default("web"),
});

export type LoginDTO = z.infer<typeof loginSchema>;

// Schema Register (ASP.NET Identity Password Standards)
export const registerSchema = z.object({
    email: z.string().trim().email("Format email tidak valid"),
    password: z
        .string()
        .min(6, "Password minimal 6 karakter")
        .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
        .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
        .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    name: z.string().trim().min(2, "Nama minimal 2 karakter").optional().or(z.literal("")),
    clientType: z.enum(["web", "mobile"]).optional().default("web"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

// Schema Create / Upsert Google OAuth User
export const googleAuthUserSchema = z.object({
    email: z.string().trim().email("Format email tidak valid"),
    name: z.string().optional().nullable(),
    googleId: z.string().min(1, "Google ID wajib diisi"),
    avatarUrl: z.string().url("Format URL avatar tidak valid").optional().nullable(),
});

export type GoogleAuthUserDTO = z.infer<typeof googleAuthUserSchema>;

// Safe User Response (Exclude passwordHash)
export type SafeUser = Omit<User, "passwordHash">;