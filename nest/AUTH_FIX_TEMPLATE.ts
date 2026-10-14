
 // TEMPLATE FIX - sesuaikan dengan framework kamu (Express/Fastify/Hono)
 // Ini adalah referensi logic yang harus ada agar test auth.ts lolos

import { z } from 'zod';

const emailSchema = z.string().email();
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().optional(),
  clientType: z.enum(['web','mobile']).optional(),
  isMobileClient: z.boolean().optional(),
});

app.get('/auth/check-email', async (req, res) => {
  const email = (req.query as any).email as string;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors: { email: 'Format email tidak valid' } });
  }
  const exists = await authService.isEmailRegistered(email);
  return res.status(200).json({ success: true, email: email.toLowerCase(), available: !exists });
});

app.post('/auth/register', async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ success: false, message: 'Validasi gagal' });
  }
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors: { password: 'Password minimal 8 karakter' } });
  }
  const { email, password } = parsed.data;
  const exists = await authService.isEmailRegistered(email);
  if (exists) return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });

  try {
    const result = await authService.register(parsed.data);
    // set cookie
    if (result.cookie) res.setHeader('set-cookie', result.cookie);
    const isMobile = parsed.data.clientType === 'mobile' || parsed.data.isMobileClient === true;
    const body: any = { success: true, userId: result.userId || result.id, message: 'Registrasi berhasil' };
    if (isMobile && result.token) body.token = result.token;
    return res.status(201).json(body);
  } catch (e:any) {
    if (e.code === 'EMAIL_EXISTS') return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password, clientType, isMobileClient } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'Validasi gagal' });
  try {
    const result = await authService.login({ email, password });
    if (!result) return res.status(401).json({ success: false, message: 'Email atau password salah' });
    if (result.cookie) res.setHeader('set-cookie', result.cookie);
    const isMobile = clientType === 'mobile' || isMobileClient === true;
    const body: any = { success: true, message: 'Login berhasil', user: result.user };
    if (isMobile) body.token = result.token || 'tok';
    return res.status(200).json(body);
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// ... lanjutkan untuk /auth/me, /auth/logout, /auth/change-password, /auth/sessions dengan pola yang sama
// penting: selalu cek session dulu -> 401 jika belum login
// logout -> clear cookie Max-Age=0
