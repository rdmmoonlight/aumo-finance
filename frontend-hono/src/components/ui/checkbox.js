export function Checkbox({ id, label, checked = false }) {
  return `<label for="${id}" class="flex items-center gap-2 text-sm font-medium cursor-pointer"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''} class="h-4 w-4 rounded border-primary text-primary focus:ring-1 focus:ring-ring" />${label}</label>`;
}
