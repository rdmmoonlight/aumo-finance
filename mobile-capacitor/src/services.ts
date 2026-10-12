// Composition root: merakit lapisan data. Hanya modul ini yang mengikat
// implementasi Capacitor; modul lain menerima dependensi lewat konstruktor
// sehingga bisa diuji tanpa perangkat.
import { AuthApi } from './auth/authApi';
import { AuthService } from './auth/authService';
import { API_URL, NETWORK_TIMEOUT_MS } from './config/env';
import { fileLogSink } from './logging/fileLogSink';
import { Logger } from './logging/logger';
import { ApiClient, capacitorTransport } from './network/apiClient';
import { secureKeyValueStore } from './network/secureKeyValueStore';
import { Session } from './network/session';
import { SessionStore } from './network/sessionStore';

export const logger = new Logger(fileLogSink);
export const session = new Session();
export const sessionStore = new SessionStore(secureKeyValueStore);

/**
 * Dipasang oleh router (Fase 5) untuk berpindah ke Login. Hingga saat itu cukup
 * membersihkan sesi, sehingga request berikutnya tidak memakai token basi.
 */
let unauthorizedListener: (() => void) | null = null;
export function setUnauthorizedListener(listener: (() => void) | null): void {
  unauthorizedListener = listener;
}

export const apiClient = new ApiClient({
  baseUrl: API_URL,
  timeoutMs: NETWORK_TIMEOUT_MS,
  transport: capacitorTransport,
  getToken: () => session.token,
  onUnauthorized: () => {
    session.clear();
    void sessionStore.clear();
    unauthorizedListener?.();
  },
  logger,
});

export const authApi = new AuthApi(apiClient);
export const authService = new AuthService({ api: authApi, session, sessionStore, logger });
