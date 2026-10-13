export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    clientType?: 'web' | 'mobile';
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface SessionItem {
    id: string;
    userId: string;
    userAgent?: string;
    ipAddress?: string;
    isCurrent?: boolean;
    createdAt: string;
}

// Konfigurasi dasar endpoint API Auth
const BASE_URL = '/api/auth';

export const AuthClient = {
    async checkEmail(email: string): Promise<{ success: boolean; available: boolean; email: string }> {
        const res = await fetch(`${BASE_URL}/check-email?email=${encodeURIComponent(email)}`, {
            headers: { 'Accept': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Validasi email gagal');
        return data;
    },

    async register(payload: RegisterPayload): Promise<{ success: boolean; userId: string; token?: string }> {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, clientType: payload.clientType || 'web' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registrasi gagal');
        return data;
    },

    async login(payload: LoginPayload): Promise<{ success: boolean; message: string }> {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login gagal');
        return data;
    },

    async getMe(): Promise<{ success: boolean; data: { user: User } }> {
        const res = await fetch(`${BASE_URL}/me`, {
            headers: { 'Accept': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unauthorized');
        return data;
    },

    async getSessions(): Promise<{ success: boolean; data: SessionItem[] }> {
        const res = await fetch(`${BASE_URL}/sessions`, {
            headers: { 'Accept': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengambil daftar sesi');
        return data;
    },

    async revokeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mencabut sesi');
        return data;
    },

    async logout(): Promise<{ success: boolean }> {
        const res = await fetch(`${BASE_URL}/logout`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal logout');
        return data;
    }
};