import { cva } from 'class-variance-authority';

export const textareaVariants = cva(
  'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
);

export function Textarea({ className = '', placeholder = '', children = '', ...props }) {
  const attr = Object.entries(props).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<textarea class="${textareaVariants({ className })}" placeholder="${placeholder}" ${attr}>${children}</textarea>`;
}
