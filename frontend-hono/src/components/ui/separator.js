import { cva } from 'class-variance-authority';

export const separatorVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'h-full w-[1px]',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export function Separator({ orientation = 'horizontal', className = '' }) {
  return `<div role="none" class="${separatorVariants({ orientation, className })}"></div>`;
}
