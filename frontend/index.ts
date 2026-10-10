const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const API_BASE = "";

type AuthMode = "login" | "register";

const $ = (id: string): HTMLElement | null => document.getElementById(id);

const els = {
  redirecting: $("redirecting"),
  btnLogin: $("btn-login") as HTMLButtonElement | null,
  btnRegister: $("btn-register") as HTMLButtonElement | null,
  loginText: $("login-text"),
  overlay: $("modal-overlay"),
  modalTitle: $("modal-title"),
  modalClose: $("modal-close") as HTMLButtonElement | null,
  formContainer: $("auth-form-container"),
  googleContainer: $("google-btn-container"),
};

let authMode: AuthMode = "login";

function setCheckingAuth(val: boolean): void {
  if (els.btnLogin) els.btnLogin.disabled = val;
  if (els.btnRegister) els.btnRegister.disabled = val;
  if (els.loginText)
    els.loginText.textContent = val ? "Checking..." : "Sign In";
}

// FIX UTAMA: anti "Unexpected end of JSON input"
async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function checkAuthStatus(): Promise<void> {
  try {
    setCheckingAuth(true);
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    const data = await safeJson(res);
    if (res.ok && (data as any).success) {
      if (els.redirecting) els.redirecting.classList.add("active");
      window.location.replace("/home");
    }
  } catch {
    // belum login, biarin
  } finally {
    setCheckingAuth(false);
  }
}

function setupEvents(): void {
  if (els.btnLogin)
    els.btnLogin.addEventListener("click", () => openModal("login"));
  if (els.btnRegister)
    els.btnRegister.addEventListener("click", () => openModal("register"));
  if (els.modalClose) els.modalClose.addEventListener("click", closeModal);
  if (els.overlay) {
    els.overlay.addEventListener("click", (ev) => {
      if (ev.target === els.overlay) closeModal();
    });
  }
}

function openModal(mode: AuthMode): void {
  authMode = mode;
  if (els.modalTitle)
    els.modalTitle.textContent =
      mode === "login" ? "Sign In to Aumo" : "Create an Account";
  if (els.overlay) els.overlay.classList.add("active");
  renderForm();
}

function closeModal(): void {
  if (els.overlay) els.overlay.classList.remove("active");
}

function handleSuccess(): void {
  closeModal();
  window.location.replace("/home");
}

function renderForm(): void {
  if (!els.formContainer) return;

  if (authMode === "login") {
    els.formContainer.innerHTML = `
      <form id="login-form" class="form">
        <input name="email" class="input" type="email" required placeholder="Email" />
        <input name="password" class="input" type="password" required placeholder="Password" />
        <button class="btn btn-primary" type="submit">Masuk</button>
        <p style="text-align:center; font-size:12px; color:#71717a;">Belum punya akun? <button type="button" id="switch-reg" class="link-btn">Daftar</button></p>
      </form>`;
    const form = document.getElementById("login-form");
    const switchBtn = document.getElementById("switch-reg");
    if (form) form.addEventListener("submit", handleLogin);
    if (switchBtn)
      switchBtn.addEventListener("click", () => openModal("register"));
  } else {
    els.formContainer.innerHTML = `
      <form id="register-form" class="form">
        <input name="name" class="input" type="text" required placeholder="Nama Lengkap" />
        <input name="email" class="input" type="email" required placeholder="Email" />
        <input name="password" class="input" type="password" required placeholder="Password" />
        <button class="btn btn-primary" type="submit">Buat Akun</button>
        <p style="text-align:center; font-size:12px; color:#71717a;">Sudah punya akun? <button type="button" id="switch-login" class="link-btn">Masuk</button></p>
      </form>`;
    const form = document.getElementById("register-form");
    const switchBtn = document.getElementById("switch-login");
    if (form) form.addEventListener("submit", handleRegister);
    if (switchBtn)
      switchBtn.addEventListener("click", () => openModal("login"));
  }
}

async function handleLogin(e: Event): Promise<void> {
  e.preventDefault();
  const target = e.target as HTMLFormElement;
  const payload = Object.fromEntries(new FormData(target).entries());
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error((data as any).message || "Login gagal");
    handleSuccess();
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

async function handleRegister(e: Event): Promise<void> {
  e.preventDefault();
  const target = e.target as HTMLFormElement;
  const payload = Object.fromEntries(new FormData(target).entries());
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error((data as any).message || "Register gagal");
    handleSuccess();
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

declare global {
  interface Window {
    google?: any;
  }
}

function initGoogle(): void {
  const timer = window.setInterval(() => {
    if (!window.google) return;
    clearInterval(timer);
    if (!els.googleContainer) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (resp: any) => {
        try {
          const res = await fetch(`${API_BASE}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ credential: resp.credential }),
          });
          const data = await safeJson(res);
          if (res.ok && (data as any).success !== false) handleSuccess();
          else alert((data as any).message || "Google auth gagal");
        } catch (err: unknown) {
          alert(err instanceof Error ? err.message : String(err));
        }
      },
    });
    window.google.accounts.id.renderButton(els.googleContainer, {
      theme: "filled_black",
      size: "large",
      width: 360,
      shape: "pill",
    });
  }, 200);
}

export function initLanding(): void {
  checkAuthStatus();
  setupEvents();
  initGoogle();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initLanding);
}
