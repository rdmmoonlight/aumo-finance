// CONFIG - ganti ini
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const API_BASE = ""; // isi http://localhost:xxxx kalau beda origin

let checkingAuth = true;
let authMode = "login";

const $ = (id) => document.getElementById(id);
const els = {
  redirecting: $("redirecting"),
  btnLogin: $("btn-login"),
  btnRegister: $("btn-register"),
  loginText: $("login-text"),
  overlay: $("modal-overlay"),
  modalTitle: $("modal-title"),
  modalClose: $("modal-close"),
  formContainer: $("auth-form-container"),
  googleContainer: $("google-btn-container"),
};

document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  setupEvents();
  initGoogle();
});

function setCheckingAuth(val) {
  checkingAuth = val;
  els.btnLogin.disabled = val;
  els.btnRegister.disabled = val;
  els.loginText.textContent = val ? "Checking..." : "Sign In";
}

async function checkAuthStatus() {
  try {
    setCheckingAuth(true);
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      els.redirecting.classList.add("active");
      window.location.replace("/home");
    }
  } catch {}
  finally { setCheckingAuth(false); }
}

function setupEvents() {
  els.btnLogin.addEventListener("click", () => openModal("login"));
  els.btnRegister.addEventListener("click", () => openModal("register"));
  els.modalClose.addEventListener("click", closeModal);
  els.overlay.addEventListener("click", (e) => {
    if (e.target === els.overlay) closeModal();
  });
}

function openModal(mode) {
  authMode = mode;
  els.modalTitle.textContent = mode === "login" ? "Sign In to Aumo" : "Create an Account";
  els.overlay.classList.add("active");
  renderForm();
}

function closeModal() {
  els.overlay.classList.remove("active");
}

function handleSuccess() {
  closeModal();
  window.location.replace("/home");
}

function renderForm() {
  if (authMode === "login") {
    els.formContainer.innerHTML = `
      <form id="login-form" class="form">
        <input name="email" class="input" type="email" required placeholder="Email" />
        <input name="password" class="input" type="password" required placeholder="Password" />
        <button class="btn btn-primary" type="submit">Masuk</button>
        <p style="text-align:center; font-size:12px; color:#71717a;">Belum punya akun? <button type="button" id="switch-reg" class="link-btn">Daftar</button></p>
      </form>`;
    $("login-form").addEventListener("submit", handleLogin);
    $("switch-reg").addEventListener("click", () => openModal("register"));
  } else {
    els.formContainer.innerHTML = `
      <form id="register-form" class="form">
        <input name="name" class="input" type="text" required placeholder="Nama Lengkap" />
        <input name="email" class="input" type="email" required placeholder="Email" />
        <input name="password" class="input" type="password" required placeholder="Password" />
        <button class="btn btn-primary" type="submit">Buat Akun</button>
        <p style="text-align:center; font-size:12px; color:#71717a;">Sudah punya akun? <button type="button" id="switch-login" class="link-btn">Masuk</button></p>
      </form>`;
    $("register-form").addEventListener("submit", handleRegister);
    $("switch-login").addEventListener("click", () => openModal("login"));
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target));
  try {
    const res = await fetch(`${API_BASE}/auth/login`, { method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include", body:JSON.stringify(payload) });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message);
    handleSuccess();
  } catch(err){ alert(err.message); }
}

async function handleRegister(e) {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target));
  try {
    const res = await fetch(`${API_BASE}/auth/register`, { method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include", body:JSON.stringify(payload) });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message);
    handleSuccess();
  } catch(err){ alert(err.message); }
}

function initGoogle() {
  const timer = setInterval(() => {
    if (!window.google) return;
    clearInterval(timer);
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (resp) => {
        const res = await fetch(`${API_BASE}/auth/google`, { method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include", body:JSON.stringify({ credential: resp.credential }) });
        if(res.ok) handleSuccess();
        else alert("Google auth gagal");
      }
    });
    window.google.accounts.id.renderButton(els.googleContainer, { theme:"filled_black", size:"large", width:360, shape:"pill" });
  }, 200);
}
