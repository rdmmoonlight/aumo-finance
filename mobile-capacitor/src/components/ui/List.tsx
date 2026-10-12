import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

export function List({ children }: { children: ReactNode }) {
  return (
    <ul className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface">
      {children}
    </ul>
  );
}

interface ListItemProps {
  title: string;
  supporting?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}

/** Baris daftar. Area sentuh minimum 48px. */
export function ListItem({ title, supporting, leading, trailing, onClick }: ListItemProps) {
  const body = (
    <>
      {leading}
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-body text-content">{title}</p>
        {supporting && <p className="truncate text-caption text-content-muted">{supporting}</p>}
      </div>
      {trailing}
    </>
  );
  const row = 'flex min-h-button w-full items-center gap-lg px-lg py-sm';

  return (
    <li>
      {onClick ? (
        <button type="button" onClick={onClick} className={cx(row, 'active:bg-surface-elevated')}>
          {body}
        </button>
      ) : (
        <div className={row}>{body}</div>
      )}
    </li>
  );
}
