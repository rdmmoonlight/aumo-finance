import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Kolom isian. Tinggi 56px (AumoDimens.InputHeightMax), minimum 48px. */
export function Input({ label, error, className, id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-sm">
      <label htmlFor={inputId} className="text-secondary text-content-secondary">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cx(
          'h-input-max min-h-input-min w-full rounded-xl border bg-surface px-lg',
          'text-body text-content placeholder:text-content-muted',
          'focus:border-primary focus:outline-none disabled:opacity-40',
          error ? 'border-bad' : 'border-outline',
          className
        )}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-caption text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
