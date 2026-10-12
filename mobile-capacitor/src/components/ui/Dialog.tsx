import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  title: string;
  onDismiss: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

/** Dialog modal berbasis elemen <dialog> (fokus dan Esc ditangani browser). */
export function Dialog({ open, title, onDismiss, children, actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onDismiss();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
      className="m-auto w-[calc(100%-2*var(--spacing-screen))] max-w-md rounded-2xl bg-surface p-card
        text-content backdrop:bg-black/70"
    >
      <h2 id={titleId} className="text-h4 font-bold">
        {title}
      </h2>
      <div className="mt-sm text-body text-content-secondary">{children}</div>
      {actions && <div className="mt-lg flex justify-end gap-sm">{actions}</div>}
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  dismissText: string;
  onConfirm: () => void;
  onDismiss: () => void;
  destructive?: boolean;
}

/** Dialog konfirmasi dua tombol (padanan ConfirmDialog.kt). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  dismissText,
  onConfirm,
  onDismiss,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onDismiss={onDismiss}
      actions={
        <>
          <Button variant="text" onClick={onDismiss}>
            {dismissText}
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      {message}
    </Dialog>
  );
}
