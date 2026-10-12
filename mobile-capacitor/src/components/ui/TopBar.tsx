import type { ReactNode } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
}

/** Bilah atas. Tinggi 56px (AumoDimens.TopAppBarHeight). */
export function TopBar({ title, onBack, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-topbar items-center gap-sm border-b border-outline bg-background px-sm">
      {onBack && (
        <button
          type="button"
          aria-label="Kembali"
          onClick={onBack}
          className="flex size-button items-center justify-center rounded-full active:bg-surface-elevated"
        >
          <IconArrowLeft size={24} />
        </button>
      )}
      <h1 className="flex-1 truncate px-sm text-h4 font-bold">{title}</h1>
      {actions}
    </header>
  );
}
