const navigation = [
  { title: "Home", url: "/home", icon: "home" },
  { title: "Dashboard", url: "/dashboard", icon: "layout-dashboard" },
  { title: "Periods", url: "/periods", icon: "calendar" },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: "book-open" },
  { title: "Journal Entry", url: "/journal-entry", icon: "file-spreadsheet" },
  { title: "Reports", url: "/reports", icon: "file-bar-chart" },
  { title: "Tools", url: "/tools", icon: "wrench" },
  { title: "Settings", url: "/settings", icon: "settings" },
];

// SVG icons (Lucide-style, inline agar tidak bergantung pada library eksternal)
const icons = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  "layout-dashboard": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
  "book-open": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>`,
  "file-spreadsheet": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>`,
  "file-bar-chart": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 18v-2"/><path d="M12 18v-4"/><path d="M16 18v-6"/></svg>`,
  wrench: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  "panel-left": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>`,
  "panel-left-close": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  "chevrons-up-down": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>`,
  "log-out": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
};

/**
 * Inisialisasi sidebar
 * @param {Object} options
 * @param {string} options.container - selector container tempat sidebar akan di-render
 * @param {Object} [options.user] - data user { fullName, email, avatarUrl }
 * @param {Function} [options.onLogout] - callback saat logout
 * @param {string} [options.currentPath] - path aktif saat ini
 */
export function createNavMenu({
  container,
  user = null,
  onLogout = null,
  currentPath = window.location.pathname,
} = {}) {
  const root = typeof container === "string" ? document.querySelector(container) : container;
  if (!root) {
    console.error("NavMenu: container tidak ditemukan");
    return;
  }

  let isCollapsed = false;
  let isDropdownOpen = false;

  // Render struktur
  root.innerHTML = `
    <aside class="sidebar" id="app-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">
            <img src="/favicon.ico" alt="Aumo" width="28" height="28" />
          </div>
          <h2 class="sidebar-title">Aumo Finance</h2>
        </div>
        <button class="sidebar-collapse-btn" id="sidebar-toggle" aria-label="Toggle sidebar">
          ${icons["panel-left-close"]}
        </button>
      </div>

      <div class="sidebar-content">
        <div class="sidebar-group-label">Navigation</div>
        <ul class="sidebar-menu" id="sidebar-menu"></ul>
      </div>

      <div class="sidebar-footer" style="position: relative;">
        <button class="user-trigger" id="user-trigger" aria-haspopup="true" aria-expanded="false">
          <div class="user-info">
            <div class="user-avatar" id="user-avatar"></div>
            <div class="user-details">
              <span class="user-name" id="user-name">Guest</span>
              <span class="user-email" id="user-email">Tidak ada email</span>
            </div>
          </div>
          <span class="chevron">${icons["chevrons-up-down"]}</span>
        </button>

        <div class="user-dropdown" id="user-dropdown">
          <a href="/settings" class="dropdown-item">
            ${icons.settings}
            Settings
          </a>
          <button class="dropdown-item destructive" id="logout-btn">
            ${icons["log-out"]}
            Sign Out
          </button>
        </div>
      </div>

      <div class="sidebar-rail"></div>
    </aside>
  `;

  const sidebar = root.querySelector("#app-sidebar");
  const menuEl = root.querySelector("#sidebar-menu");
  const toggleBtn = root.querySelector("#sidebar-toggle");
  const userTrigger = root.querySelector("#user-trigger");
  const dropdown = root.querySelector("#user-dropdown");
  const logoutBtn = root.querySelector("#logout-btn");

  // Render menu items
  function renderMenu() {
    menuEl.innerHTML = navigation
      .map((item) => {
        const isActive =
          currentPath === item.url ||
          (item.url !== "/home" && currentPath.startsWith(item.url + "/"));

        return `
          <li class="sidebar-menu-item" data-tooltip="${item.title}">
            <a href="${item.url}" class="sidebar-menu-link ${isActive ? "active" : ""}" data-url="${item.url}">
              ${icons[item.icon] || ""}
              <span>${item.title}</span>
            </a>
          </li>
        `;
      })
      .join("");
  }

  // Update user info
  function updateUser(userData) {
    const nameEl = root.querySelector("#user-name");
    const emailEl = root.querySelector("#user-email");
    const avatarEl = root.querySelector("#user-avatar");

    if (!userData) {
      nameEl.textContent = "Guest";
      emailEl.textContent = "Tidak ada email";
      avatarEl.innerHTML = icons.user;
      return;
    }

    nameEl.textContent = userData.fullName || userData.userName || "Guest";
    emailEl.textContent = userData.email || "Tidak ada email";

    if (userData.avatarUrl) {
      avatarEl.innerHTML = `<img src="${userData.avatarUrl}" alt="${nameEl.textContent}" />`;
    } else if (userData.fullName) {
      avatarEl.textContent = userData.fullName.slice(0, 2).toUpperCase();
    } else {
      avatarEl.innerHTML = icons.user;
    }
  }

  // Toggle collapse
  function toggleCollapse() {
    isCollapsed = !isCollapsed;
    sidebar.classList.toggle("collapsed", isCollapsed);
    toggleBtn.innerHTML = isCollapsed ? icons["panel-left"] : icons["panel-left-close"];
  }

  // Toggle dropdown
  function toggleDropdown(e) {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    dropdown.classList.toggle("open", isDropdownOpen);
    userTrigger.setAttribute("aria-expanded", String(isDropdownOpen));
  }

  function closeDropdown() {
    isDropdownOpen = false;
    dropdown.classList.remove("open");
    userTrigger.setAttribute("aria-expanded", "false");
  }

  // Event listeners
  toggleBtn.addEventListener("click", toggleCollapse);
  userTrigger.addEventListener("click", toggleDropdown);
  document.addEventListener("click", (e) => {
    if (!userTrigger.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  logoutBtn.addEventListener("click", async () => {
    closeDropdown();
    if (typeof onLogout === "function") {
      await onLogout();
    } else {
      // Default behavior (bisa diganti sesuai kebutuhan backend Anda)
      document.cookie = "AumoFinance.Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.replace("/");
    }
  });

  // Initial render
  renderMenu();
  updateUser(user);

  // Public API
  return {
    setUser: updateUser,
    setActivePath: (path) => {
      currentPath = path;
      renderMenu();
    },
    collapse: () => {
      if (!isCollapsed) toggleCollapse();
    },
    expand: () => {
      if (isCollapsed) toggleCollapse();
    },
    toggle: toggleCollapse,
  };
}

// Auto-init jika ada elemen dengan data-nav-menu
document.addEventListener("DOMContentLoaded", () => {
  const autoEl = document.querySelector("[data-nav-menu]");
  if (autoEl) {
    createNavMenu({ container: autoEl });
  }
});
