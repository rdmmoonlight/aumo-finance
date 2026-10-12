export function createDialog({ id, title, description, content, actions = '' }) {
  return `<dialog id="${id}" class="rounded-lg p-6 backdrop:bg-black/50 backdrop:backdrop-blur-sm border shadow-lg max-w-lg w-full">
    <div class="flex flex-col space-y-2 text-left">
      <h3 class="text-lg font-semibold leading-none">${title}</h3>
      ${description ? `<p class="text-sm text-muted-foreground">${description}</p>` : ''}
    </div>
    <div class="py-4">${content}</div>
    <div class="flex justify-end gap-2">${actions}</div>
  </dialog>`;
}
export function openDialog(id) { document.getElementById(id)?.showModal(); }
export function closeDialog(id) { document.getElementById(id)?.close(); }
