import { cva } from 'class-variance-authority';

export const cardVariants = cva('rounded-xl border bg-card text-card-foreground shadow');

export function Card({ className = '', children = '' }) {
  return `<div class="${cardVariants({ className })}">${children}</div>`;
}

export function CardHeader({ className = '', children = '' }) {
  return `<div class="flex flex-col space-y-1.5 p-6 ${className}">${children}</div>`;
}

export function CardTitle({ className = '', children = '' }) {
  return `<h3 class="font-semibold leading-none tracking-tight ${className}">${children}</h3>`;
}

export function CardDescription({ className = '', children = '' }) {
  return `<p class="text-sm text-muted-foreground ${className}">${children}</p>`;
}

export function CardContent({ className = '', children = '' }) {
  return `<div class="p-6 pt-0 ${className}">${children}</div>`;
}

export function CardFooter({ className = '', children = '' }) {
  return `<div class="flex items-center p-6 pt-0 ${className}">${children}</div>`;
}
