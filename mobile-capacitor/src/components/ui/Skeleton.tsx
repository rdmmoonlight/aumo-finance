import { cx } from '../../lib/cx';

/** Penanda posisi saat data dimuat. Ukuran lewat className (mis. h-4 w-1/2). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx('animate-pulse rounded-lg bg-surface-elevated', className)}
    />
  );
}
