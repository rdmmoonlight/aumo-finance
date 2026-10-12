import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary active:brightness-90',
  outline: 'border border-outline text-content active:bg-surface-elevated',
  danger: 'bg-bad text-on-primary active:brightness-90',
  text: 'text-content-secondary active:bg-surface-elevated',
};

/** Tombol aksi. Tinggi minimum 48px (AumoDimens.ButtonHeight). */
export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex min-h-button items-center justify-center gap-sm rounded-xl px-lg',
        'text-body font-bold disabled:opacity-40',
        variants[variant],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    />
  );
}
