import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "aumo_login_throttle";

/** Batas percobaan login gagal sebelum diminta istirahat. */
export const MAX_FAILED_ATTEMPTS = 5;
/** Lama istirahat (detik) setelah batas tercapai. */
export const COOLDOWN_SECONDS = 60;

type ThrottleState = { failed: number; lockedUntil: number };

const EMPTY: ThrottleState = { failed: 0, lockedUntil: 0 };

function read(): ThrottleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ThrottleState>;
    return {
      failed: Number(parsed.failed) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0,
    };
  } catch {
    return EMPTY;
  }
}

function write(state: ThrottleState): void {
  try {
    if (state.failed === 0 && state.lockedUntil === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Penyimpanan tidak tersedia: batas tetap berlaku selama halaman terbuka.
  }
}

export function useLoginThrottle() {
  const [state, setState] = useState<ThrottleState>(read);
  const [now, setNow] = useState<number>(() => Date.now());

  const remainingSeconds = Math.max(
    0,
    Math.ceil((state.lockedUntil - now) / 1000),
  );
  const isLocked = remainingSeconds > 0;
  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - state.failed);

  // Hitung mundur setiap detik selama terkunci.
  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  // Masa istirahat selesai: reset hitungan gagal.
  useEffect(() => {
    if (state.lockedUntil > 0 && !isLocked) {
      setState(EMPTY);
      write(EMPTY);
    }
  }, [state.lockedUntil, isLocked]);

  const applyLock = useCallback((until: number, failed: number) => {
    const next = { failed, lockedUntil: until };
    setNow(Date.now());
    setState(next);
    write(next);
  }, []);

  /** Catat satu percobaan gagal. `serverLockoutEnd` (ISO) dari backend diutamakan bila lebih lama. */
  const registerFailure = useCallback(
    (serverLockoutEnd?: string) => {
      const failed = state.failed + 1;
      const serverUntil = serverLockoutEnd ? Date.parse(serverLockoutEnd) : NaN;
      let until = 0;
      if (failed >= MAX_FAILED_ATTEMPTS) {
        until = Date.now() + COOLDOWN_SECONDS * 1000;
      }
      if (!Number.isNaN(serverUntil) && serverUntil > Date.now()) {
        until = Math.max(until, serverUntil);
      }
      applyLock(until, failed);
    },
    [state.failed, applyLock],
  );

  /** Backend membalas 429: paksa istirahat. */
  const lockNow = useCallback(
    (seconds: number = COOLDOWN_SECONDS) => {
      applyLock(Date.now() + seconds * 1000, MAX_FAILED_ATTEMPTS);
    },
    [applyLock],
  );

  const registerSuccess = useCallback(() => {
    setState(EMPTY);
    write(EMPTY);
  }, []);

  return {
    isLocked,
    remainingSeconds,
    attemptsLeft,
    registerFailure,
    registerSuccess,
    lockNow,
  };
}

export function lockedMessage(seconds: number): string {
  return `Terlalu banyak percobaan gagal. Silakan istirahat dulu, coba lagi dalam ${seconds} detik.`;
}
