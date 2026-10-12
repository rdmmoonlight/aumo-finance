import { cva } from 'class-variance-authority';

export const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Alert({ variant, className = '', children = '' }) {
  return `<div role="alert" class="${alertVariants({ variant, className })}">${children}</div>`;
}

export function AlertTitle({ className = '', children = '' }) {
  return `<h5 class="mb-1 font-medium leading-none tracking-tight ${className}">${children}</h5>`;
}

export function AlertDescription({ className = '', children = '' }) {
  return `<div class="text-sm [&_p]:leading-relaxed ${className}">${children}</div>`;
}
