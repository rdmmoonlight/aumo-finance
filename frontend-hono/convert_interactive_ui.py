import os

UI_DIR = "src/components/ui"
CATALOG_PATH = "src/pages/ui-catalog.js"

# 15 Komponen Interaktif Target
INTERACTIVE_COMPONENTS = [
    "dialog", "alert-dialog", "sheet", "popover", "tooltip", 
    "dropdown-menu", "select", "tabs", "toggle", "toggle-group", 
    "radio-group", "checkbox", "collapsible", "scroll-area", "navigation-menu"
]

JS_TEMPLATES = {
    "dialog": r"""export function createDialog({ id, title, description, content, actions = '' }) {
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
""",

    "alert-dialog": r"""import { createDialog } from './dialog.js';

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
""",

    "sheet": r"""export function createSheet({ id, side = 'right', title, content }) {
  const sideClasses = {
    right: 'ml-auto h-full max-h-screen w-80 inset-y-0 right-0 rounded-l-xl',
    left: 'mr-auto h-full max-h-screen w-80 inset-y-0 left-0 rounded-r-xl',
    bottom: 'mt-auto w-full max-w-none inset-x-0 bottom-0 rounded-t-xl',
  };
  return `<dialog id="${id}" class="m-0 p-6 backdrop:bg-black/50 border shadow-xl ${sideClasses[side] || sideClasses.right}">
    <div class="flex justify-between items-center pb-4 border-b">
      <h3 class="text-lg font-semibold">${title}</h3>
      <button onclick="document.getElementById('${id}').close()" class="p-1 rounded-md hover:bg-accent">✕</button>
    </div>
    <div class="pt-4">${content}</div>
  </dialog>`;
}
""",

    "popover": r"""export function Popover({ triggerId, popoverId, triggerLabel, content }) {
  return `<button popovertarget="${popoverId}" id="${triggerId}" class="px-4 py-2 text-sm border rounded-md hover:bg-accent">${triggerLabel}</button>
  <div id="${popoverId}" popover class="p-4 rounded-md border bg-popover shadow-md">${content}</div>`;
}
""",

    "tooltip": r"""export function Tooltip({ text, children }) {
  return `<span class="group relative inline-block">${children}
    <span role="tooltip" class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">${text}</span>
  </span>`;
}
""",

    "dropdown-menu": r"""export function DropdownMenu({ triggerId, menuId, label, items = [] }) {
  const menuItemsHtml = items.map(item => `<button role="menuitem" class="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent focus:bg-accent focus:outline-none" onclick="document.getElementById('${menuId}').hidePopover()">${item.label}</button>`).join('');
  return `<button popovertarget="${menuId}" id="${triggerId}" class="px-4 py-2 text-sm border rounded-md hover:bg-accent flex items-center gap-1">${label} ▾</button>
  <div id="${menuId}" popover class="p-1 rounded-md border bg-popover shadow-md space-y-1 min-w-[8rem]"><div role="menu" tabIndex="-1">${menuItemsHtml}</div></div>`;
}
""",

    "select": r"""export function Select({ id, options = [], className = '' }) {
  const optionsHtml = options.map(opt => `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`).join('');
  return `<select id="${id}" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}">${optionsHtml}</select>`;
}
""",

    "tabs": r"""export function initTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const triggers = container.querySelectorAll('[role="tab"]');
  const panels = container.querySelectorAll('[role="tabpanel"]');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const target = trigger.getAttribute('aria-controls');
      triggers.forEach(t => { t.setAttribute('aria-selected', 'false'); t.classList.remove('bg-background', 'shadow-sm'); });
      panels.forEach(p => p.classList.add('hidden'));
      trigger.setAttribute('aria-selected', 'true');
      trigger.classList.add('bg-background', 'shadow-sm');
      container.querySelector(`#${target}`)?.classList.remove('hidden');
    });
  });
}
export function Tabs({ containerId, tabs = [] }) {
  const triggersHtml = tabs.map((tab, idx) => `<button role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}" aria-controls="panel-${tab.id}" class="px-3 py-1.5 text-sm font-medium rounded-md transition-all ${idx === 0 ? 'bg-background shadow-sm' : ''}">${tab.label}</button>`).join('');
  const panelsHtml = tabs.map((tab, idx) => `<div id="panel-${tab.id}" role="tabpanel" class="${idx !== 0 ? 'hidden' : ''} pt-4">${tab.content}</div>`).join('');
  return `<div id="${containerId}"><div role="tablist" class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">${triggersHtml}</div>${panelsHtml}</div>`;
}
""",

    "toggle": r"""export function Toggle({ id, label, pressed = false }) {
  return `<button id="${id}" type="button" aria-pressed="${pressed}" onclick="this.setAttribute('aria-pressed', this.getAttribute('aria-pressed') === 'true' ? 'false' : 'true')" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground h-9 px-3 border">${label}</button>`;
}
""",

    "toggle-group": r"""import { Toggle } from './toggle.js';
export function ToggleGroup({ items = [] }) {
  return `<div class="inline-flex items-center justify-center rounded-md border p-1 gap-1">${items.map(item => Toggle({ id: item.id, label: item.label, pressed: item.pressed })).join('')}</div>`;
}
""",

    "radio-group": r"""export function RadioGroup({ name, options = [] }) {
  return `<div role="radiogroup" class="grid gap-2">${options.map(opt => `<label class="flex items-center gap-2 text-sm font-medium cursor-pointer"><input type="radio" name="${name}" value="${opt.value}" ${opt.checked ? 'checked' : ''} class="aspect-square h-4 w-4 rounded-full border border-primary text-primary focus:ring-1 focus:ring-ring" />${opt.label}</label>`).join('')}</div>`;
}
""",

    "checkbox": r"""export function Checkbox({ id, label, checked = false }) {
  return `<label for="${id}" class="flex items-center gap-2 text-sm font-medium cursor-pointer"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''} class="h-4 w-4 rounded border-primary text-primary focus:ring-1 focus:ring-ring" />${label}</label>`;
}
""",

    "collapsible": r"""export function Collapsible({ title, content, open = false }) {
  return `<details ${open ? 'open' : ''} class="group border rounded-lg p-4 [&_summary::-webkit-details-marker]:hidden"><summary class="flex cursor-pointer items-center justify-between font-medium text-sm">${title}<span class="transition group-open:rotate-180">▾</span></summary><div class="mt-4 text-sm text-muted-foreground">${content}</div></details>`;
}
""",

    "scroll-area": r"""export function ScrollArea({ className = '', children = '' }) {
  return `<div class="relative overflow-auto max-h-48 border rounded-md p-4 scrollbar-thin scrollbar-thumb-muted ${className}">${children}</div>`;
}
""",

    "navigation-menu": r"""export function NavigationMenu({ items = [] }) {
  const linksHtml = items.map(item => `<li><a href="${item.href}" class="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none">${item.label}</a></li>`).join('');
  return `<nav class="relative z-10 flex max-w-max flex-1 items-center justify-center"><ul class="group flex flex-1 list-none items-center justify-center space-x-1">${linksHtml}</ul></nav>`;
}
"""
}

def main():
    os.makedirs(UI_DIR, exist_ok=True)

    print("=== [1/2] Menulis file JS untuk 15 Komponen Interaktif ===")
    for comp in INTERACTIVE_COMPONENTS:
        js_file = os.path.join(UI_DIR, f"{comp}.js")
        tsx_file = os.path.join(UI_DIR, f"{comp}.tsx")

        with open(js_file, "w", encoding="utf-8") as f:
            f.write(JS_TEMPLATES[comp])
        print(f"  [OK] Ditulis: {js_file}")

        if os.path.exists(tsx_file):
            os.remove(tsx_file)
            print(f"  [CLEANUP] Dihapus: {tsx_file}")

    print("\n=== [2/2] Selesai ===")
    print(" Ke-15 komponen interaktif telah dikonversi ke ES Module .js.")

if __name__ == "__main__":
    main()