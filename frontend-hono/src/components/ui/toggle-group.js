import { Toggle } from './toggle.js';
export function ToggleGroup({ items = [] }) {
  return `<div class="inline-flex items-center justify-center rounded-md border p-1 gap-1">${items.map(item => Toggle({ id: item.id, label: item.label, pressed: item.pressed })).join('')}</div>`;
}
