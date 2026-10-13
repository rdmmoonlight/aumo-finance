import { navigateTo } from '../router';
import { AuthClient } from '../services/auth-client';
import { appStore } from '../store/appStore';

export function renderAuthPage(): string {
  return `
    <section class="max-w-md mx-auto px-6 py-16">
      <div class="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
        <!-- Tabs Header -->
        <div class="flex border-b border-slate-700 mb-6">
          <button id="tab-login-btn" type="button" class="flex-1 py-2.5 font-semibold text-center border-b-2 border-indigo-500 text-indigo-400 transition">
            Masuk
          </button>
          <button id="tab-register-btn" type="button" class="flex-1 py-2.5 font-semibold text-center border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition">
            Daftar
          </button>
        </div>

        <!-- Alert Notification -->
        <div id="auth-alert" class="hidden p-3.5 mb-5 rounded-xl text-sm font-medium border"></div>

        <!-- Form Login -->
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
            <input type="email" id="login-email" required placeholder="user@aumo.com" class="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input type="password" id="login-password" required placeholder="••••••••" class="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" />
          </div>
          <button type="submit" id="login-submit-btn" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition text-sm flex justify-center items-center gap-2 mt-2">
            Masuk Ke Akun
          </button>
        </form>

        <!-- Form Register -->
        <form id="register-form" class="space-y-4 hidden">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <input type="text" id="reg-name" required placeholder="John Doe" class="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
            <input type="email" id="reg-email" required placeholder="user@aumo.com" class="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" />
            <p id="email-availability-msg" class="text-xs mt-1 hidden"></p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input type="password" id="reg-password" required placeholder="Password123!" class="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" />
          </div>
          <button type="submit" id="reg-submit-btn" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition text-sm flex justify-center items-center gap-2 mt-2">
            Buat Akun Baru
          </button>
        </form>
      </div>
    </section>
  `;
}

export function setupAuthEvents(): void {
  const loginBtn = document.getElementById('tab-login-btn');
  const regBtn = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
  const regForm = document.getElementById('register-form') as HTMLFormElement | null;
  const alertEl = document.getElementById('auth-alert');
  const regEmailInput = document.getElementById('reg-email') as HTMLInputElement | null;
  const emailMsg = document.getElementById('email-availability-msg');

  const showAlert = (message: string, isError = true) => {
    if (!alertEl) return;
    alertEl.classList.remove('hidden', 'bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-400', 'bg-rose-500/10', 'border-rose-500/30', 'text-rose-400');
    if (isError) {
      alertEl.classList.add('bg-rose-500/10', 'border-rose-500/30', 'text-rose-400');
    } else {
      alertEl.classList.add('bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-400');
    }
    alertEl.textContent = message;
  };

  const switchToRegister = () => {
    if (!loginBtn || !regBtn || !loginForm || !regForm) return;
    regBtn.className = 'flex-1 py-2.5 font-semibold text-center border-b-2 border-indigo-500 text-indigo-400 transition';
    loginBtn.className = 'flex-1 py-2.5 font-semibold text-center border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition';
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    if (alertEl) alertEl.classList.add('hidden');
  };

  const switchToLogin = () => {
    if (!loginBtn || !regBtn || !loginForm || !regForm) return;
    loginBtn.className = 'flex-1 py-2.5 font-semibold text-center border-b-2 border-indigo-500 text-indigo-400 transition';
    regBtn.className = 'flex-1 py-2.5 font-semibold text-center border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition';
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    if (alertEl) alertEl.classList.add('hidden');
  };

  // Aktifkan tab sesuai rute URL awal (/register)
  if (window.location.pathname === '/register') {
    switchToRegister();
  }

  // Event handler toggle tab
  loginBtn?.addEventListener('click', switchToLogin);
  regBtn?.addEventListener('click', switchToRegister);

  // Validasi ketersediaan email on-blur (/check-email)
  regEmailInput?.addEventListener('blur', async () => {
    const email = regEmailInput.value.trim();
    if (!email || !emailMsg) return;

    try {
      const res = await AuthClient.checkEmail(email);
      emailMsg.classList.remove('hidden', 'text-rose-400', 'text-emerald-400');
      if (res.available) {
        emailMsg.classList.add('text-emerald-400');
        emailMsg.textContent = 'Email tersedia';
      } else {
        emailMsg.classList.add('text-rose-400');
        emailMsg.textContent = 'Email sudah terdaftar';
      }
    } catch (err: unknown) {
      emailMsg.classList.remove('hidden', 'text-emerald-400');
      emailMsg.classList.add('text-rose-400');
      emailMsg.textContent = err instanceof Error ? err.message : 'Format email tidak valid';
    }
  });

  // Handle submit form login (/login)
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;

    try {
      const res = await AuthClient.login({ email, password });
      showAlert(res.message || 'Login berhasil!', false);

      // Sinkronisasi state global user
      await appStore.getState().fetchProfile();

      setTimeout(() => {
        navigateTo('/');
      }, 500);
    } catch (err: unknown) {
      showAlert(err instanceof Error ? err.message : 'Kredensial tidak valid');
    }
  });

  // Handle submit form register (/register)
  regForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('reg-name') as HTMLInputElement).value;
    const email = regEmailInput?.value || '';
    const password = (document.getElementById('reg-password') as HTMLInputElement).value;

    try {
      await AuthClient.register({ name, email, password, clientType: 'web' });
      showAlert('Registrasi berhasil! Mengalihkan...', false);

      // Sinkronisasi state global user
      await appStore.getState().fetchProfile();

      setTimeout(() => {
        navigateTo('/');
      }, 500);
    } catch (err: unknown) {
      showAlert(err instanceof Error ? err.message : 'Registrasi gagal');
    }
  });
}