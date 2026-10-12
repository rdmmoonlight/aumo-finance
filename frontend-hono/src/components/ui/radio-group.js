export function RadioGroup({ name, options = [] }) {
  return `<div role="radiogroup" class="grid gap-2">${options.map(opt => `<label class="flex items-center gap-2 text-sm font-medium cursor-pointer"><input type="radio" name="${name}" value="${opt.value}" ${opt.checked ? 'checked' : ''} class="aspect-square h-4 w-4 rounded-full border border-primary text-primary focus:ring-1 focus:ring-ring" />${opt.label}</label>`).join('')}</div>`;
}
