// Variable Konfigurasi Utama Sidebar
const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Helper untuk membaca/menulis state sidebar di Cookie
 */
export function getSidebarStateFromCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${SIDEBAR_COOKIE_NAME}=([^;]*)`));
  return match ? match[1] === 'true' : true;
}

export function setSidebarStateToCookie(open) {
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

/**
 * Menyiapkan Event Listener global untuk keyboard shortcut (Ctrl+B / Cmd+B) dan Toggle Sidebar
 */
export function initSidebar(containerId = 'sidebar-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const toggleSidebar = () => {
    const currentState = container.getAttribute('data-state') === 'expanded';
    const newState = !currentState;
    container.setAttribute('data-state', newState ? 'expanded' : 'collapsed');
    setSidebarStateToCookie(newState);
  };

  // Bind click kesemua tombol trigger
  document.querySelectorAll('[data-sidebar="trigger"]').forEach((btn) => {
    btn.addEventListener('click', toggleSidebar);
  });

  // Shortcut Keyboard (Ctrl + B / Cmd + B)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggleSidebar();
    }
  });
}

/**
 * Komponen Provider & Container Utama
 */
export function SidebarProvider({ id = 'sidebar-container', defaultOpen = true, children = '' }) {
  const isOpen = defaultOpen;
  return `
    <div 
      id="${id}" 
      data-state="${isOpen ? 'expanded' : 'collapsed'}"
      class="group/sidebar-wrapper flex min-h-svh w-full bg-background text-foreground"
      style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem;"
    >
      ${children}
    </div>
  `;
}

/**
 * Panel Sidebar Utama
 */
export function Sidebar({ className = '', children = '' }) {
  return `
    <aside 
      data-sidebar="sidebar"
      class="group peer hidden md:flex flex-col h-svh sticky top-0 z-10 w-[var(--sidebar-width)] transition-[width] duration-200 ease-linear border-r bg-sidebar text-sidebar-foreground group-data-[state=collapsed]/sidebar-wrapper:w-[var(--sidebar-width-icon)] ${className}"
    >
      <div class="flex h-full w-full flex-col overflow-hidden">
        ${children}
      </div>
    </aside>
  `;
}

export function SidebarHeader({ className = '', children = '' }) {
  return `<div data-sidebar="header" class="flex flex-col gap-2 p-2 ${className}">${children}</div>`;
}

export function SidebarFooter({ className = '', children = '' }) {
  return `<div data-sidebar="footer" class="flex flex-col gap-2 p-2 ${className}">${children}</div>`;
}

export function SidebarContent({ className = '', children = '' }) {
  return `<div data-sidebar="content" class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[state=collapsed]/sidebar-wrapper:overflow-hidden ${className}">${children}</div>`;
}

export function SidebarInset({ className = '', children = '' }) {
  return `<main data-sidebar="inset" class="relative flex w-full flex-1 flex-col bg-background p-4 ${className}">${children}</main>`;
}

export function SidebarTrigger({ className = '' }) {
  return `
    <button 
      type="button"
      data-sidebar="trigger"
      aria-label="Toggle Sidebar"
      class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none ${className}"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
      <span class="sr-only">Toggle Sidebar</span>
    </button>
  `;
}

export function SidebarGroup({ className = '', children = '' }) {
  return `<div data-sidebar="group" class="relative flex w-full min-w-0 flex-col p-2 ${className}">${children}</div>`;
}

export function SidebarGroupLabel({ className = '', children = '' }) {
  return `
    <div 
      data-sidebar="group-label" 
      class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground/70 transition-[opacity] duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 ${className}"
    >
      ${children}
    </div>
  `;
}

export function SidebarMenu({ className = '', children = '' }) {
  return `<ul data-sidebar="menu" class="flex w-full min-w-0 flex-col gap-1 ${className}">${children}</ul>`;
}

export function SidebarMenuItem({ className = '', children = '' }) {
  return `<li data-sidebar="menu-item" class="group/menu-item relative ${className}">${children}</li>`;
}

export function SidebarMenuButton({ isActive = false, className = '', children = '', href = '#' }) {
  const activeClass = isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground';
  return `
    <a 
      href="${href}"
      data-sidebar="menu-button"
      class="flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm transition-colors ${activeClass} ${className}"
    >
      ${children}
    </a>
  `;
}