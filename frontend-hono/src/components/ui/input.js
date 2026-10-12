import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
);

export function Input({ type = 'text', className = '', placeholder = '', value = '', ...props }) {
  const attr = Object.entries(props).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<input type="${type}" class="${inputVariants({ className })}" placeholder="${placeholder}" value="${value}" ${attr} />`;
}
