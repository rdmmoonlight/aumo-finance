import { z } from "zod";

// Skema untuk Sign In
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email tidak boleh kosong")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong")
    .min(6, "Password minimal 6 karakter"),
  keepMe: z.boolean().default(false),
});

// Skema untuk Sign Up (Register)
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email tidak boleh kosong")
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(1, "Password tidak boleh kosong")
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password tidak boleh kosong"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

// Skema Gabungan / Dinamis untuk Form Tunggal (Aumo Workspace)
export const authSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("login"),
    email: z
      .string()
      .min(1, "Email tidak boleh kosong")
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(1, "Password tidak boleh kosong")
      .min(6, "Password minimal 6 karakter"),
    keepMe: z.boolean().default(false),
  }),
  z
    .object({
      mode: z.literal("register"),
      email: z
        .string()
        .min(1, "Email tidak boleh kosong")
        .email("Format email tidak valid"),
      password: z
        .string()
        .min(1, "Password tidak boleh kosong")
        .min(8, "Password minimal 8 karakter")
        .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
        .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
      confirmPassword: z
        .string()
        .min(1, "Konfirmasi password tidak boleh kosong"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Konfirmasi password tidak cocok",
      path: ["confirmPassword"],
    }),
]);

// Tipe data inferred
export type LoginFormValues = z.input<typeof loginSchema>;
export type RegisterFormValues = z.input<typeof registerSchema>;
export type AuthFormValues = z.input<typeof authSchema>;
