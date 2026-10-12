export function DropdownMenu({ triggerId, menuId, label, items = [] }) {
  const menuItemsHtml = items.map(item => `<button role="menuitem" class="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent focus:bg-accent focus:outline-none" onclick="document.getElementById('${menuId}').hidePopover()">${item.label}</button>`).join('');
  return `<button popovertarget="${menuId}" id="${triggerId}" class="px-4 py-2 text-sm border rounded-md hover:bg-accent flex items-center gap-1">${label} ▾</button>
  <div id="${menuId}" popover class="p-1 rounded-md border bg-popover shadow-md space-y-1 min-w-[8rem]"><div role="menu" tabIndex="-1">${menuItemsHtml}</div></div>`;
}
