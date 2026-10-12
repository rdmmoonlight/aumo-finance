export function Select({ id, options = [], className = '' }) {
  const optionsHtml = options.map(opt => `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`).join('');
  return `<select id="${id}" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}">${optionsHtml}</select>`;
}
