import { cva } from 'class-variance-authority';

export const skeletonVariants = cva('animate-pulse rounded-md bg-primary/10');

export function Skeleton({ className = '' }) {
  return `<div class="${skeletonVariants({ className })}"></div>`;
}
