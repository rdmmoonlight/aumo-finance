import { createStore } from 'zustand/vanilla';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = `${BASE_URL}/api/v1/auth`;

// Tipe Data User sesuai endpoint /api/v1/auth/me
export interface UserProfile {
    id: string;
    userId: string;
    email: string;
    userName: string;
    fullName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    bio?: string;
    roles: string[];
    customClaims?: Record<string, any>[];
}

export interface LoginPayload {
    email: string;
    password?: string;
    rememberMe?: boolean;
    isMobileClient?: boolean;
    userAgent?: string;
    operatingSystem?: string;
}

export interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (payload: LoginPayload) => Promise<boolean>;
    googleLogin: (idToken: string) => Promise<boolean>;
    fetchProfile: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const authStore = createStore<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    // 1. Password Login (Cookie-based untuk Web)
    login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Wajib agar Cookie Session tersimpan di browser
                body: JSON.stringify({
                    email: payload.email,
                    password: payload.password,
                    rememberMe: payload.rememberMe ?? false,
                    isMobileClient: false,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login gagal.');
            }

            // Setelah login berhasil, ambil data profile user penuh
            await get().fetchProfile();
            set({ isLoading: false });
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Terjadi kesalahan saat login.', isLoading: false });
            return false;
        }
    },

    // 2. Google OAuth via ID Token
    googleLogin: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    idToken,
                    isMobileClient: false,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Google login gagal.');
            }

            await get().fetchProfile();
            set({ isLoading: false });
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Terjadi kesalahan saat Google login.', isLoading: false });
            return false;
        }
    },

    // 3. Get User Profile (/api/v1/auth/me)
    fetchProfile: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_BASE_URL}/me`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Sesi telah berakhir.');
            }

            const result = await response.json();

            if (result.success && result.data) {
                set({
                    user: result.data as UserProfile,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            }
        } catch (err: any) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    // 4. Logout
    logout: async () => {
        set({ isLoading: true });
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },
}));