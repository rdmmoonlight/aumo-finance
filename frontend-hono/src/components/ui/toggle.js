export function Toggle({ id, label, pressed = false }) {
  return `<button id="${id}" type="button" aria-pressed="${pressed}" onclick="this.setAttribute('aria-pressed', this.getAttribute('aria-pressed') === 'true' ? 'false' : 'true')" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground h-9 px-3 border">${label}</button>`;
}
