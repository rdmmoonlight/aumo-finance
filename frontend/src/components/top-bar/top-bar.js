const icons = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  alert: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  database: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
  refresh: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
  loader: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="topbar-spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
};

/**
 * @typedef {Object} NotificationItem
 * @property {string} id
 * @property {string} title
 * @property {string} message
 * @property {string} [type] - "warning" | "info"
 * @property {boolean} [isRead]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} PeriodItem
 * @property {string} periodName
 * @property {boolean} isSelected
 * @property {boolean} [isClosed]
 */

/**
 * @typedef {Object} TopBarOptions
 * @property {string|HTMLElement} container
 * @property {string} [currentPath]
 * @property {PeriodItem[]} [periods]
 * @property {boolean} [isPeriodLoading]
 * @property {"online"|"connecting"|"offline"} [dbStatus]
 * @property {boolean} [isHealthFetching]
 * @property {NotificationItem[]} [notifications]
 * @property {boolean} [isNotificationsLoading]
 * @property {Function} [onSearch]
 * @property {Function} [onMarkAsRead]
 * @property {Function} [onMarkAllAsRead]
 * @property {Function} [onRefreshHealth]
 */

/**
 * Membuat Top Bar modular
 * @param {TopBarOptions} options
 */
export function createTopBar(options = {}) {
  const {
    container,
    currentPath = window.location.pathname,
    periods = [],
    isPeriodLoading = false,
    dbStatus = "online",
    isHealthFetching = false,
    notifications = [],
    isNotificationsLoading = false,
    onSearch = null,
    onMarkAsRead = null,
    onMarkAllAsRead = null,
    onRefreshHealth = null,
  } = options;

  const root =
    typeof container === "string"
      ? document.querySelector(container)
      : container;

  if (!root) {
    console.error("TopBar: container tidak ditemukan");
    return null;
  }

  let isPopoverOpen = false;
  let currentState = {
    currentPath,
    periods,
    isPeriodLoading,
    dbStatus,
    isHealthFetching,
    notifications,
    isNotificationsLoading,
  };

  // ----- Render helpers -----

  function formatSegment(segment) {
    return decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function renderBreadcrumb(path) {
    const segments = path.split("/").filter(Boolean);
    let html = `
      <li>
        <a href="/home">Home</a>
      </li>
    `;

    segments.forEach((segment, index) => {
      if (segment === "home" && index === 0) return;

      const url = `/${segments.slice(0, index + 1).join("/")}`;
      const isLast = index === segments.length - 1;
      const name = formatSegment(segment);

      html += `<li class="topbar-breadcrumb-sep">/</li>`;

      if (isLast) {
        html += `<li><span class="current">${name}</span></li>`;
      } else {
        html += `<li><a href="${url}">${name}</a></li>`;
      }
    });

    return html;
  }

  function renderPeriodBadge() {
    const selected = currentState.periods.find((p) => p.isSelected);

    if (selected) {
      const closedClass = selected.isClosed ? "closed" : "";
      const statusText = selected.isClosed ? " (Closed)" : " (Aktif)";
      const pulseClass = selected.isClosed ? "" : "pulse";

      return `
        <span class="topbar-badge badge-period ${closedClass}">
          <span class="dot ${pulseClass}"></span>
          Periode: ${selected.periodName}${statusText}
        </span>
      `;
    }

    const text = currentState.isPeriodLoading
      ? "Memuat periode..."
      : "Belum Ada Periode Dipilih";

    return `
      <span class="topbar-badge">
        <span class="dot" style="background:#94a3b8"></span>
        ${text}
      </span>
    `;
  }

  function renderDbStatus() {
    const { dbStatus, isHealthFetching } = currentState;

    if (dbStatus === "online") {
      return `
        <div class="topbar-db-group">
          ${icons.database}
          <span class="topbar-badge badge-db badge-db-online">
            <span class="dot"></span>
            DB: Connected
          </span>
        </div>
      `;
    }

    if (dbStatus === "connecting") {
      return `
        <div class="topbar-db-group">
          ${icons.database}
          <span class="topbar-badge badge-db badge-db-connecting">
            <span class="dot"></span>
            DB: Connecting...
          </span>
        </div>
      `;
    }

    // offline
    return `
      <div class="topbar-db-group">
        ${icons.database}
        <span class="topbar-badge badge-db badge-db-offline">
          <span class="dot" style="background:white"></span>
          DB: Disconnected
        </span>
        <button class="topbar-refresh-btn ${isHealthFetching ? "spinning" : ""}" id="topbar-refresh-db" title="Coba hubungkan ulang">
          ${icons.refresh}
        </button>
      </div>
    `;
  }

  function renderNotifications() {
    const { notifications, isNotificationsLoading } = currentState;
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    let listHtml = "";

    if (isNotificationsLoading) {
      listHtml = `
        <div class="topbar-loading">
          ${icons.loader}
          Memuat notifikasi...
        </div>
      `;
    } else if (notifications.length === 0) {
      listHtml = `
        <div class="topbar-empty">Tidak ada notifikasi saat ini.</div>
      `;
    } else {
      listHtml = notifications
        .map((item) => {
          const typeClass = item.type === "warning" ? "warning" : "info";
          const icon = item.type === "warning" ? icons.alert : icons.info;
          const readClass = item.isRead ? "read" : "unread";
          const time = item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return `
            <div class="topbar-notif-item ${readClass}" data-id="${item.id}" data-read="${item.isRead ? "1" : "0"}">
              <div class="topbar-notif-icon ${typeClass}">${icon}</div>
              <div class="topbar-notif-body">
                <div class="topbar-notif-head">
                  <p class="topbar-notif-title">${item.title || ""}</p>
                  <span class="topbar-notif-time">${time}</span>
                </div>
                <p class="topbar-notif-message">${item.message || ""}</p>
              </div>
            </div>
          `;
        })
        .join("");
    }

    const badgeHtml =
      unreadCount > 0
        ? `<span class="topbar-badge topbar-badge-sm">${unreadCount} baru</span>`
        : "";

    const markAllHtml =
      unreadCount > 0
        ? `<button class="topbar-link-btn" id="topbar-mark-all">Tandai dibaca</button>`
        : "";

    return {
      unreadCount,
      header: `
        <div class="topbar-popover-title">
          <span>Notifikasi</span>
          ${badgeHtml}
        </div>
        ${markAllHtml}
      `,
      list: listHtml,
    };
  }

  function render() {
    const notif = renderNotifications();
    const hasUnread = notif.unreadCount > 0;

    root.innerHTML = `
      <header class="topbar" id="app-topbar">
        <!-- Bar Utama -->
        <div class="topbar-main">
          <div class="topbar-search-wrapper">
            <span class="topbar-search-icon">${icons.search}</span>
            <input
              type="search"
              class="topbar-search-input"
              id="topbar-search"
              placeholder="Cari transaksi, akun, atau laporan..."
            />
          </div>

          <div class="topbar-actions" style="position: relative;">
            <button class="topbar-icon-btn" id="topbar-notif-btn" aria-label="Notifikasi">
              ${icons.bell}
              ${hasUnread ? `<span class="topbar-notif-dot"></span>` : ""}
            </button>

            <div class="topbar-popover" id="topbar-popover">
              <div class="topbar-popover-header">
                ${notif.header}
              </div>
              <div class="topbar-notif-list">
                ${notif.list}
              </div>
            </div>
          </div>
        </div>

        <hr class="topbar-separator" />

        <!-- Bar Sekunder -->
        <div class="topbar-secondary">
          <ul class="topbar-breadcrumb" id="topbar-breadcrumb">
            ${renderBreadcrumb(currentState.currentPath)}
          </ul>

          <div class="topbar-status">
            <div id="topbar-period">${renderPeriodBadge()}</div>
            <div class="topbar-status-sep"></div>
            <div id="topbar-db">${renderDbStatus()}</div>
          </div>
        </div>
      </header>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Search
    const searchInput = root.querySelector("#topbar-search");
    if (searchInput && typeof onSearch === "function") {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          onSearch(searchInput.value);
        }
      });
    }

    // Notifikasi toggle
    const notifBtn = root.querySelector("#topbar-notif-btn");
    const popover = root.querySelector("#topbar-popover");

    if (notifBtn && popover) {
      notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isPopoverOpen = !isPopoverOpen;
        popover.classList.toggle("open", isPopoverOpen);
      });
    }

    // Tutup popover saat klik di luar
    document.addEventListener("click", (e) => {
      if (
        isPopoverOpen &&
        popover &&
        !popover.contains(e.target) &&
        !notifBtn.contains(e.target)
      ) {
        isPopoverOpen = false;
        popover.classList.remove("open");
      }
    });

    // Mark all as read
    const markAllBtn = root.querySelector("#topbar-mark-all");
    if (markAllBtn && typeof onMarkAllAsRead === "function") {
      markAllBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        markAllBtn.disabled = true;
        markAllBtn.textContent = "Memproses...";
        try {
          await onMarkAllAsRead();
        } finally {
          // State akan di-update dari luar melalui update()
        }
      });
    }

    // Mark single as read
    root.querySelectorAll(".topbar-notif-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const id = item.dataset.id;
        const isRead = item.dataset.read === "1";
        if (isRead || !id || typeof onMarkAsRead !== "function") return;

        try {
          await onMarkAsRead(id);
        } catch (err) {
          console.error(err);
        }
      });
    });

    // Refresh DB
    const refreshBtn = root.querySelector("#topbar-refresh-db");
    if (refreshBtn && typeof onRefreshHealth === "function") {
      refreshBtn.addEventListener("click", () => {
        onRefreshHealth();
      });
    }
  }

  // Initial render
  render();

  // ----- Public API -----
  return {
    /**
     * Update data Top Bar
     * @param {Partial<TopBarOptions>} next
     */
    update(next = {}) {
      currentState = {
        ...currentState,
        ...next,
      };
      // Jaga agar popover tidak tertutup secara tidak perlu saat update data
      const wasOpen = isPopoverOpen;
      render();
      if (wasOpen) {
        const popover = root.querySelector("#topbar-popover");
        if (popover) {
          popover.classList.add("open");
          isPopoverOpen = true;
        }
      }
    },

    setPath(path) {
      this.update({ currentPath: path });
    },

    setPeriods(periods, isLoading = false) {
      this.update({ periods, isPeriodLoading: isLoading });
    },

    setDbStatus(status, isFetching = false) {
      this.update({ dbStatus: status, isHealthFetching: isFetching });
    },

    setNotifications(notifications, isLoading = false) {
      this.update({ notifications, isNotificationsLoading: isLoading });
    },

    destroy() {
      root.innerHTML = "";
    },
  };
}
