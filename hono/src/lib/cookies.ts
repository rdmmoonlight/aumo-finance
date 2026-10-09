import { deleteCookie, setCookie } from 'hono/cookie';
import { env } from './env.js';

export const AUTH_COOKIE = 'access_token';
export const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 hari detik, bukan 30 detik

export function setAuthCookie(c: Parameters<typeof setCookie>[0], token: string) {
    setCookie(c, AUTH_COOKIE, token, {
        httpOnly: true,
        path: '/',
        maxAge: AUTH_COOKIE_MAX_AGE,
        sameSite: 'Lax',
        secure: env.NODE_ENV === 'production',
    });
}

export function clearAuthCookie(c: Parameters<typeof deleteCookie>[0]) {
    deleteCookie(c, AUTH_COOKIE, {
        path: '/',
    });
}