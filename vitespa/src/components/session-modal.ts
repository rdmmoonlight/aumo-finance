import { AuthClient, type SessionItem, type User } from '../services/auth-client';

export function renderSessionModal(): string {
  return `
    <div id="session-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <!-- Close Button -->
        <button id="close-session-modal" class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">✕</button>

        <!-- Profile Section (/me) -->
        <div class="border-b border-slate-800 pb-5 mb-5">
          <h3 class="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Profil Pengguna</h3>
          <div id="user-profile-content" class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-lg" id="user-avatar">
              ?
            </div>
            <div>
              <h4 id="user-name" class="font-bold text-white text-base">Memuat...</h4>
              <p id="user-email" class="text-sm text-slate-400">-</p>
            </div>
          </div>
        </div>

        <!-- Sessions Section (/sessions) -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Sesi Aktif Perangkat</h3>
            <span id="session-count" class="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">0 Sesi</span>
          </div>
          
          <div id="session-alert" class="hidden p-3 mb-3 text-xs rounded-lg"></div>

          <!-- Session List Container -->
          <div id="session-list" class="space-y-3 max-h-60 overflow-y-auto pr-1">
            <div class="text-sm text-slate-500 text-center py-4">Memuat data sesi...</div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
          <button id="logout-btn" class="text-xs font-semibold text-rose-400 hover:text-rose-300 transition">
            Keluar dari Akun Ini
          </button>
          <button id="done-session-modal" class="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  `;
}

export function setupSessionModalEvents(): void {
  const modal = document.getElementById('session-modal');
  const closeBtn = document.getElementById('close-session-modal');
  const doneBtn = document.getElementById('done-session-modal');
  const logoutBtn = document.getElementById('logout-btn');
  const sessionList = document.getElementById('session-list');
  const alertEl = document.getElementById('session-alert');

  const nameEl = document.getElementById('user-name');
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  const countEl = document.getElementById('session-count');

  // Expose fungsi global agar bisa dipanggil dari komponen mana pun (Navbar, Dashboard, dll)
  (window as any).openSessionManager = async () => {
    if (!modal) return;
    modal.classList.remove('hidden');
    await loadProfileAndSessions();
  };

  const closeModal = () => modal?.classList.add('hidden');

  closeBtn?.addEventListener('click', closeModal);
  doneBtn?.addEventListener('click', closeModal);

  // Load Profil (/me) dan Sesi
  async function loadProfileAndSessions() {
    try {
      // 1. Fetch Profil
      const profileRes = await AuthClient.getMe();
      const user: User = profileRes.data.user;

      if (nameEl) nameEl.textContent = user.name || 'Pengguna';
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) avatarEl.textContent = (user.name || user.email)[0].toUpperCase();

      // 2. Fetch Sesi Aktif
      const sessionRes = await AuthClient.getSessions();
      renderSessions(sessionRes.data || []);
    } catch (err: any) {
      if (sessionList) {
        sessionList.innerHTML = `<div class="text-xs text-rose-400 text-center py-4">${err.message || 'Gagal memuat profil/sesi'}</div>`;
      }
    }
  }

  function renderSessions(sessions: SessionItem[]) {
    if (!sessionList) return;
    if (countEl) countEl.textContent = `${sessions.length} Sesi`;

    if (sessions.length === 0) {
      sessionList.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">Tidak ada sesi aktif.</div>`;
      return;
    }

    sessionList.innerHTML = sessions.map((sess) => `
      <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex justify-between items-center text-xs">
        <div>
          <div class="font-semibold text-slate-200 flex items-center gap-1.5">
            ${sess.userAgent || 'Browser / Perangkat'}
            ${sess.isCurrent ? '<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded">Sesi Ini</span>' : ''}
          </div>
          <div class="text-slate-400 text-[11px] mt-0.5">
            IP: ${sess.ipAddress || 'Unknown'} • ${new Date(sess.createdAt).toLocaleDateString('id-ID')}
          </div>
        </div>
        ${!sess.isCurrent ? `
          <button data-revoke-id="${sess.id}" class="revoke-btn text-rose-400 hover:text-rose-300 font-medium text-[11px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1 rounded-lg transition">
            Cabut
          </button>
        ` : ''}
      </div>
    `).join('');

    // Attach handler ke tombol DELETE /sessions/:id
    sessionList.querySelectorAll<HTMLButtonElement>('.revoke-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-revoke-id');
        if (!id) return;

        btn.disabled = true;
        btn.textContent = 'Mencabut...';

        try {
          await AuthClient.revokeSession(id);
          showAlert('Sesi berhasil dicabut', false);
          await loadProfileAndSessions();
        } catch (err: any) {
          showAlert(err.message || 'Gagal mencabut sesi', true);
          btn.disabled = false;
          btn.textContent = 'Cabut';
        }
      });
    });
  }

  function showAlert(msg: string, isError: boolean) {
    if (!alertEl) return;
    alertEl.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-400', 'bg-rose-500/10', 'text-rose-400');
    alertEl.classList.add(isError ? 'bg-rose-500/10' : 'bg-emerald-500/10', isError ? 'text-rose-400' : 'text-emerald-400');
    alertEl.textContent = msg;
    setTimeout(() => alertEl.classList.add('hidden'), 3000);
  }

  // Handle Logout
  logoutBtn?.addEventListener('click', async () => {
    try {
      await AuthClient.logout();
      window.location.href = '/auth';
    } catch {
      window.location.href = '/auth';
    }
  });
}