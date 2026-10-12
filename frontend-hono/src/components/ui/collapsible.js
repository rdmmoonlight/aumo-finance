export function Collapsible({ title, content, open = false }) {
  return `<details ${open ? 'open' : ''} class="group border rounded-lg p-4 [&_summary::-webkit-details-marker]:hidden"><summary class="flex cursor-pointer items-center justify-between font-medium text-sm">${title}<span class="transition group-open:rotate-180">▾</span></summary><div class="mt-4 text-sm text-muted-foreground">${content}</div></details>`;
}
