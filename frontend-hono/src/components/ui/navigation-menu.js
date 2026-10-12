export function NavigationMenu({ items = [] }) {
  const linksHtml = items.map(item => `<li><a href="${item.href}" class="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none">${item.label}</a></li>`).join('');
  return `<nav class="relative z-10 flex max-w-max flex-1 items-center justify-center"><ul class="group flex flex-1 list-none items-center justify-center space-x-1">${linksHtml}</ul></nav>`;
}
