export function Tooltip({ text, children }) {
  return `<span class="group relative inline-block">${children}
    <span role="tooltip" class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">${text}</span>
  </span>`;
}
