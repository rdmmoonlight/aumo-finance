import { cva } from 'class-variance-authority';

export const avatarVariants = cva('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full');

export function Avatar({ className = '', children = '' }) {
  return `<div class="${avatarVariants({ className })}">${children}</div>`;
}

export function AvatarImage({ src, alt = '', className = '' }) {
  return `<img src="${src}" alt="${alt}" class="aspect-square h-full w-full object-cover ${className}" />`;
}

export function AvatarFallback({ className = '', children = '' }) {
  return `<div class="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-semibold ${className}">${children}</div>`;
}
