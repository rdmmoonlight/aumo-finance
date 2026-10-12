export function Breadcrumb({ className = '', children = '' }) {
  return `<nav aria-label="breadcrumb" class="${className}"><ol class="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">${children}</ol></nav>`;
}

export function BreadcrumbItem({ className = '', children = '' }) {
  return `<li class="inline-flex items-center gap-1.5 ${className}">${children}</li>`;
}

export function BreadcrumbLink({ href = '#', className = '', children = '' }) {
  return `<a href="${href}" class="transition-colors hover:text-foreground ${className}">${children}</a>`;
}

export function BreadcrumbSeparator({ className = '', children = '/' }) {
  return `<li role="presentation" aria-hidden="true" class="[&>svg]:w-3.5 [&>svg]:h-3.5 ${className}">${children}</li>`;
}
