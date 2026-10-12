import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Penggabung class Tailwind yang aman dari konflik
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export { cva } from 'class-variance-authority';
