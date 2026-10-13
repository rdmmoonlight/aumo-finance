import { appStore } from '../store/appStore';
import type { Middleware } from '../types/router';

export const authGuard: Middleware = async (context) => {
    let { user, isLoading, fetchProfile } = appStore.getState();

    if (!user && localStorage.getItem('auth_token') && !isLoading) {
        await fetchProfile();
        user = appStore.getState().user;
    }

    if (!user) {
        context.redirectUrl = '/login';
        return false;
    }

    return true;
};

export const guestGuard: Middleware = (context) => {
    const { user } = appStore.getState();

    if (user) {
        context.redirectUrl = '/'; // Ganti dari '/home' ke '/' dulu agar tidak 404
        return false;
    }

    return true;
};