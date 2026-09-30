import { z } from "zod";

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

// Gunakan z.input agar tipe merepresentasikan data input form (keepMe?: boolean)
export type LoginFormValues = z.input<typeof loginSchema>;
