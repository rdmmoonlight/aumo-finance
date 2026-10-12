import { cva } from 'class-variance-authority';

export const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export function Label({ htmlFor = '', className = '', children = '' }) {
  return `<label for="${htmlFor}" class="${labelVariants({ className })}">${children}</label>`;
}
