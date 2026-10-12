import { createDialog } from './dialog.js';

export function createAlertDialog({ id, title, description, onConfirmText = 'Lanjutkan', onCancelText = 'Batal' }) {
  const actions = `
    <button onclick="document.getElementById('${id}').close()" class="px-4 py-2 text-sm border rounded-md hover:bg-accent">
      ${onCancelText}
    </button>
    <button id="${id}-confirm" class="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
      ${onConfirmText}
    </button>
  `;
  return createDialog({ id, title, description, content: '', actions });
}
