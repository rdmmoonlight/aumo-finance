import { beforeEach, describe, expect, it, vi } from 'vitest';

// 1. Mock ioredis sebelum impor lain berjalan (mencegah error ECONNREFUSED ::1:6379)
vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
      quit: vi.fn(),
    })),
  };
});

// 2. Mock AuthService menggunakan path alias `@/`
vi.mock('@/services/auth.js', () => ({
  AuthService: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    isEmailRegistered: vi.fn(),
    getSession: vi.fn(),
    changePassword: vi.fn(),
    listSessions: vi.fn(),
    revokeOtherSessions: vi.fn(),
    revokeSession: vi.fn(),
  },
}));

// 3. Mock middleware rate-limit agar tidak menyentuh Redis saat testing
vi.mock('@/middlewares/rate-limit.js', () => ({
  rateLimit: () => async (_c: unknown, next: () => Promise<void>) => await next(),
}));

// 4. Impor modul dengan path alias `@/`
import { AppError } from '@/lib/errors.js';
import { authRoute } from '@/routes/auth.js';
import { AuthService } from '@/services/auth.js';

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== GET /check-email ====================
  describe('GET /check-email', () => {
    it('harus mengembalikan available: true jika email belum terdaftar', async () => {
      vi.mocked(AuthService.isEmailRegistered).mockResolvedValue(false);

      const res = await authRoute.request('/check-email?email=user@aumo.com');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({
        success: true,
        email: 'user@aumo.com',
        available: true,
      });
      // Menggunakan expect.anything() untuk argumen kedua (Headers)
      expect(AuthService.isEmailRegistered).toHaveBeenCalledWith(
        'user@aumo.com',
        expect.anything()
      );
    });

    it('harus memvalidasi format email dan merespons 400 jika invalid', async () => {
      const res = await authRoute.request('/check-email?email=bukan-email');

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe('Validasi gagal');
    });
  });

  // ==================== POST /register ====================
  describe('POST /register', () => {
    const mockUser = {
      id: 'usr-123',
      name: 'John Doe',
      email: 'john@aumo.com',
      emailVerified: true, // Email langsung terverifikasi tanpa konfirmasi
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('berhasil registrasi web (mengembalikan 201 tanpa token)', async () => {
      vi.mocked(AuthService.register).mockResolvedValue({
        user: mockUser,
        setCookies: ['session=abc123456'],
      } as never);

      const res = await authRoute.request('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@aumo.com',
          password: 'Password123!',
          clientType: 'web',
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.userId).toBe('usr-123');
      expect(body.token).toBeUndefined();
      expect(res.headers.get('set-cookie')).toContain('session=abc123456');
    });

    it('berhasil registrasi mobile (mengembalikan token)', async () => {
      vi.mocked(AuthService.register).mockResolvedValue({
        user: mockUser,
        token: 'mobile-token-xyz',
        setCookies: [],
      } as never);

      const res = await authRoute.request('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@aumo.com',
          password: 'Password123!',
          clientType: 'mobile',
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.token).toBe('mobile-token-xyz');
    });

    it('menangani error 409 jika email sudah terdaftar', async () => {
      vi.mocked(AuthService.register).mockRejectedValue(
        new AppError('Email sudah terdaftar', 409)
      );

      const res = await authRoute.request('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@aumo.com',
          password: 'Password123!',
        }),
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.message).toBe('Email sudah terdaftar');
    });
  });

  // ==================== POST /login ====================
  describe('POST /login', () => {
    it('berhasil login dan mengembalikan data user', async () => {
      vi.mocked(AuthService.login).mockResolvedValue({
        user: {
          id: 'usr-123',
          name: 'John Doe',
          email: 'john@aumo.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        setCookies: ['session=token-cookie'],
      } as never);

      const res = await authRoute.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'john@aumo.com',
          password: 'Password123!',
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe('Login berhasil');
    });

    it('mengembalikan error 401 jika password salah', async () => {
      vi.mocked(AuthService.login).mockRejectedValue(
        new AppError('Kredensial tidak valid', 401)
      );

      const res = await authRoute.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'john@aumo.com',
          password: 'PasswordSalah',
        }),
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.message).toBe('Kredensial tidak valid');
    });
  });

  // ==================== GET /me ====================
  describe('GET /me', () => {
    it('mengembalikan status 401 jika pengguna belum login', async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue(null as never);

      const res = await authRoute.request('/me');

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.message).toContain('Unauthorized');
    });

    it('mengembalikan profil user jika terautentikasi', async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue({
        user: { id: 'usr-123', name: 'John Doe', email: 'john@aumo.com' },
        session: { id: 'sess-123', userId: 'usr-123', token: 'xyz' },
      } as never);

      const res = await authRoute.request('/me');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user.id).toBe('usr-123');
    });
  });

  // ==================== DELETE /sessions/:id ====================
  describe('DELETE /sessions/:id', () => {
    it('mencabut sesi jika terautentikasi', async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue({
        user: { id: 'usr-123' },
      } as never);
      vi.mocked(AuthService.revokeSession).mockResolvedValue(undefined as never);

      const res = await authRoute.request('/sessions/sess-999', {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('Sesi berhasil dicabut');
      expect(AuthService.revokeSession).toHaveBeenCalledWith(
        'usr-123',
        'sess-999',
        expect.anything()
      );
    });
  });
});