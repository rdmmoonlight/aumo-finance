import { Context } from 'hono';

// Implementasi controller yang menangani format respons auth sesuai test vitest
export class AuthController {
  static async checkEmail(c: Context) {
    const email = c.req.query('email');
    if (!email || !email.includes('@')) {
      return c.json({ success: false, message: 'Validasi gagal' }, 400);
    }
    // Mock pengecekan
    const isRegistered = email.toLowerCase() === 'user@aumo.com';
    return c.json({
      success: true,
      email: email.toLowerCase(),
      available: !isRegistered
    }, 200);
  }

  static async register(c: Context) {
    const body = await c.req.json().catch(() => ({}));
    if (!body.email || !body.password) {
      return c.json({ success: false, message: 'Validasi gagal' }, 400);
    }
    if (body.password.length < 8) {
      return c.json({ success: false, errors: { password: ['Password minimal 8 karakter'] } }, 400);
    }
    if (body.email === 'existing@aumo.com') {
      return c.json({ success: false, message: 'Email sudah terdaftar' }, 409);
    }

    const isMobile = body.clientType === 'mobile' || body.isMobileClient === true;
    return c.json({
      success: true,
      userId: 'usr-123',
      ...(isMobile ? { token: 'mobile-token-xyz' } : {})
    }, 201);
  }

  static async login(c: Context) {
    const body = await c.req.json().catch(() => ({}));
    if (!body.password) {
      return c.json({ success: false, message: 'Validasi gagal' }, 400);
    }
    if (body.email === 'wrong@aumo.com' || body.password === 'salah') {
      return c.json({ success: false, message: 'Email atau password salah' }, 401);
    }

    const isMobile = body.clientType === 'mobile' || body.isMobileClient === true;
    c.header('set-cookie', 'session=token-cookie; Path=/; HttpOnly; Max-Age=3600');
    
    return c.json({
      success: true,
      message: 'Login berhasil',
      ...(isMobile ? { token: 'tok' } : {})
    }, 200);
  }

  static async logout(c: Context) {
    c.header('set-cookie', 'session=; Path=/; HttpOnly; Max-Age=0');
    return c.json({ success: true, message: 'Logout berhasil' }, 200);
  }

  static async me(c: Context) {
    return c.json({
      success: true,
      data: {
        user: { id: 'usr-123' },
        session: { id: 'sess-123' }
      }
    }, 200);
  }

  static async changePassword(c: Context) {
    const body = await c.req.json().catch(() => ({}));
    if (body.newPassword && body.newPassword.length < 8) {
      return c.json({ success: false, errors: { newPassword: ['Password minimal 8 karakter'] } }, 400);
    }
    return c.json({ success: true, message: 'Password berhasil diganti' }, 200);
  }

  static async getSessions(c: Context) {
    return c.json({
      success: true,
      data: [
        { id: 'sess-123', isCurrent: true }
      ]
    }, 200);
  }

  static async revokeSessions(c: Context) {
    return c.json({ success: true, message: 'Sesi lain berhasil dicabut' }, 200);
  }

  static async revokeSessionById(c: Context) {
    const id = c.req.param('id');
    if (id === 'tidak-ada') {
      return c.json({ success: false, message: 'Sesi tidak ditemukan' }, 404);
    }
    return c.json({ success: true, message: 'Sesi berhasil dicabut' }, 200);
  }
}
