export function ScrollArea({ className = '', children = '' }) {
  return `<div class="relative overflow-auto max-h-48 border rounded-md p-4 scrollbar-thin scrollbar-thumb-muted ${className}">${children}</div>`;
}
