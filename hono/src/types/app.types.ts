// TEMP_DISABLED: import type { TokenPayload } from '../lib/auth.js';

/**
 * Tipe environment Hono: variabel yang diisi oleh middleware pipeline
 * dan dibaca oleh handler lewat c.get(...).
 */
export type AppEnv = {
  Variables: {
    requestId: string;
    user?: TokenPayload;
    sessionId: string;
  };
};
