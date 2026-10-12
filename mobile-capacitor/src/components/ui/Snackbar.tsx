import { useEffect } from 'react';

const DURATION_MS = { short: 4000, long: 10000 } as const;

interface SnackbarProps {
  /** Pesan non-null memicu Snackbar. */
  message: string | null;
  /** Dipanggil setelah durasi habis agar pesan dibersihkan dari state. */
  onConsumed: () => void;
  duration?: keyof typeof DURATION_MS;
}

/** Pesan singkat di dasar layar (padanan SnackbarMessageHost.kt). */
export function Snackbar({ message, onConsumed, duration = 'long' }: SnackbarProps) {
  useEffect(() => {
    if (message === null) return;
    const timer = setTimeout(onConsumed, DURATION_MS[duration]);
    return () => {
      clearTimeout(timer);
    };
  }, [message, duration, onConsumed]);

  if (message === null) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 p-screen pb-[max(var(--spacing-screen),env(safe-area-inset-bottom))]"
    >
      <div className="rounded-xl bg-surface-elevated px-lg py-sm text-secondary text-content shadow-lg">
        {message}
      </div>
    </div>
  );
}
