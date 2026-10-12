import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

/** Kartu. Padding 16px (AumoDimens.CardPadding). */
export function Card({ elevated = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-outline p-card',
        elevated ? 'bg-surface-elevated' : 'bg-surface',
        className
      )}
      {...rest}
    />
  );
}
