import { createStore } from 'zustand/vanilla';
import { apiClient } from '../api/client';

// Antarmuka State
interface User {
    id: string;
    name: string;
    email: string;
}

interface AppState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: () => Promise<void>;
    logout: () => void;
}

// Buat Vanilla Store (Vanilla JS/TS compatible)
export const appStore = createStore<AppState>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get<User>('/auth/me');
            set({ user: response.data, isLoading: false });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || 'Gagal memuat profil',
                isLoading: false
            });
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null });
    },
}));