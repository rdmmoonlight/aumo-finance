// Form auth versi vanilla JS (tanpa React/TSX).
// Markup ada di ./auth.html, logika ada di file ini.

import { baseApi } from "@/lib/apiClient";
import { store } from "@/lib/store";
import { authApi } from "@/lib/store/auth/authApi";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import templatesHtml from "./auth.html?raw";

/**
 * @typedef {"login" | "register"} AuthMode
 * @typedef {{
 *   initialMode?: AuthMode,
 *   onSuccess?: () => void,
 *   query?: URLSearchParams,
 * }} AuthOptions
 */

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const SAVED_EMAIL_KEY = "aumo_saved_email";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

// ===== Template =====

/** @type {HTMLElement | null} */
let templateHost = null;

/** @param {string} id */
function cloneTemplate(id) {
  if (!templateHost) {
    templateHost = document.createElement("div");
    // Sumber template adalah file statis milik proyek, bukan input pengguna.
    templateHost.innerHTML = templatesHtml;
  }
  const tpl = /** @type {HTMLTemplateElement | null} */ (
    templateHost.querySelector(`#${id}`)
  );
  if (!tpl?.content.firstElementChild) {
    throw new Error(`[auth] Template #${id} tidak ditemukan di auth.html`);
  }
  return /** @type {HTMLElement} */ (
    tpl.content.firstElementChild.cloneNode(true)
  );
}

// ===== Helper =====

/**
 * Hanya izinkan path internal agar tidak jadi open redirect.
 * @param {URLSearchParams} query
 */
export function getRedirectTarget(query) {
  const target = query.get("redirectTo") || "/home";
  const isInternal =
    target.startsWith("/") &&
    !target.startsWith("//") &&
    !target.startsWith("/\\");
  return isInternal ? target : "/home";
}

const storage = {
  /** @param {string} key */
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  /** @param {string} key @param {string} value */
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* abaikan */
    }
  },
  /** @param {string} key */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* abaikan */
    }
  },
};

let uidCounter = 0;

// ===== Google Identity Services (pengganti useGoogleLogin) =====

function loadGoogleScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  if (!document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)) {
    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(timer);
        resolve(undefined);
      } else if (Date.now() - startedAt > 10000) {
        clearInterval(timer);
        reject(new Error("Script Google gagal dimuat."));
      }
    }, 100);
  });
}

/**
 * Harus dipanggil sinkron dari event klik agar popup tidak diblokir browser.
 * @param {(accessToken: string) => void} onToken
 * @param {(message: string) => void} onError
 */
function requestGoogleAccessToken(onToken, onError) {
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    onError("Google belum siap, coba lagi sebentar.");
    loadGoogleScript().catch(() => {});
    return;
  }

  const client = oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "openid profile email",
    callback: (/** @type {any} */ res) => {
      if (res?.error) onError("Autentikasi Google dibatalkan.");
      else if (res?.access_token) onToken(res.access_token);
      else onError("Gagal mendapatkan token dari Google.");
    },
    error_callback: () => onError("Autentikasi Google dibatalkan."),
  });
  client.requestAccessToken();
}

// ===== Form =====

/**
 * Pasang form login/register ke dalam `container`.
 * @param {HTMLElement} container
 * @param {AuthOptions} [options]
 * @returns {() => void} fungsi cleanup
 */
export function mountAuthForm(container, options = {}) {
  const { onSuccess } = options;
  const query = options.query ?? new URLSearchParams(window.location.search);

  /** @type {AuthMode} */
  let mode = options.initialMode ?? "login";
  let disposed = false;
  let pending = false;
  let submitted = false;
  let keepMe = false;

  /** @type {(() => void) | null} */
  let detachForm = null;

  const finish = () => {
    if (onSuccess) onSuccess();
    else window.location.replace(getRedirectTarget(query));
  };

  container.replaceChildren(cloneTemplate("auth-skeleton"));
  if (GOOGLE_CLIENT_ID) loadGoogleScript().catch(() => {});

  // Cek sesi saat pertama kali dimuat
  const profileRequest = store.dispatch(
    authApi.endpoints.getProfile.initiate(),
  );
  (async () => {
    try {
      const result = await profileRequest;
      if (!disposed && "data" in result && result.data?.success) finish();
    } catch {
      // Belum terautentikasi: abaikan
    } finally {
      if (!disposed) render();
    }
  })();

  function render() {
    detachForm?.();

    const root = cloneTemplate("auth-form");
    /** @param {string} name */
    const ref = (name) =>
      /** @type {HTMLElement} */ (root.querySelector(`[data-ref="${name}"]`));

    // Tampilkan hanya blok yang sesuai mode
    root.querySelectorAll("[data-mode]").forEach((node) => {
      if (/** @type {HTMLElement} */ (node).dataset.mode !== mode)
        node.remove();
    });

    const isLogin = mode === "login";
    const title = ref("title");
    const subtitle = ref("subtitle");
    const form = /** @type {HTMLFormElement} */ (ref("form"));
    const google = /** @type {HTMLButtonElement} */ (ref("google"));
    const email = /** @type {HTMLInputElement} */ (ref("email"));
    const password = /** @type {HTMLInputElement} */ (ref("password"));
    const confirmPassword = /** @type {HTMLInputElement | null} */ (
      root.querySelector('[data-ref="confirmPassword"]')
    );
    const submit = /** @type {HTMLButtonElement} */ (ref("submit"));
    const apiError = ref("apiError");
    const checkbox = root.querySelector('[data-ref="keepMe"]');
    const checkboxIndicator = root.querySelector(
      '[data-ref="keepMeIndicator"]',
    );

    title.textContent = isLogin ? "Sign in" : "Create account";
    subtitle.textContent = isLogin
      ? "Masuk ke workspace kamu."
      : "Daftar untuk membuat workspace baru.";

    // Hubungkan label dengan input (id unik per instance)
    root.querySelectorAll("[data-for]").forEach((label) => {
      const input = /** @type {HTMLInputElement | null} */ (
        root.querySelector(
          `[data-ref="${/** @type {HTMLElement} */ (label).dataset.for}"]`,
        )
      );
      if (!input) return;
      input.id = `auth-${++uidCounter}-${input.name}`;
      /** @type {HTMLLabelElement} */ (label).htmlFor = input.id;
    });

    // Email tersimpan hanya untuk mode login
    const savedEmail = storage.get(SAVED_EMAIL_KEY);
    keepMe = isLogin && !!savedEmail;
    if (isLogin && savedEmail) email.value = savedEmail;

    const setKeepMe = (/** @type {boolean} */ value) => {
      keepMe = value;
      if (!checkbox || !checkboxIndicator) return;
      checkbox.setAttribute("aria-checked", String(value));
      /** @type {HTMLElement} */ (checkbox).dataset.state = value
        ? "checked"
        : "unchecked";
      /** @type {HTMLElement} */ (checkboxIndicator).hidden = !value;
    };
    setKeepMe(keepMe);

    const setApiError = (/** @type {string} */ message) => {
      apiError.textContent = message;
      apiError.hidden = !message;
    };

    const setPending = (/** @type {boolean} */ value) => {
      pending = value;
      submit.disabled = value;
      google.disabled = value;
      submit.textContent = value
        ? "Processing..."
        : isLogin
          ? "Sign In"
          : "Create Account";
    };
    setPending(false);

    // ----- Validasi (zod) -----
    const readValues = () => ({
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword?.value ?? "",
      keepMe,
    });

    const validate = () => {
      const schema = isLogin ? loginSchema : registerSchema;
      const result = schema.safeParse(readValues());
      /** @type {Record<string, string>} */
      const errors = {};
      if (!result.success) {
        for (const issue of result.error.issues) {
          const key = String(issue.path[0] ?? "");
          if (key && !(key in errors)) errors[key] = issue.message;
        }
      }
      return { success: result.success, errors };
    };

    const showErrors = (/** @type {Record<string, string>} */ errors) => {
      for (const field of ["email", "password", "confirmPassword"]) {
        const el = root.querySelector(`[data-ref="${field}Error"]`);
        if (!el) continue;
        const message = errors[field] ?? "";
        el.textContent = message;
        /** @type {HTMLElement} */ (el).hidden = !message;
      }
    };

    // ----- Aksi -----
    const handleSuccess = () => {
      if (keepMe && isLogin) storage.set(SAVED_EMAIL_KEY, email.value);
      else storage.remove(SAVED_EMAIL_KEY);
      finish();
    };

    /** @param {any} result */
    const errorMessage = (result) => {
      const data = result?.error?.data;
      return (
        data?.message ||
        data?.title ||
        (result?.error?.status === "FETCH_ERROR"
          ? "Gagal terhubung ke server backend."
          : "Email atau password salah.")
      );
    };

    const onSubmit = async (/** @type {Event} */ event) => {
      event.preventDefault();
      submitted = true;
      const { success, errors } = validate();
      showErrors(errors);
      if (!success || pending) return;

      setApiError("");
      setPending(true);
      try {
        store.dispatch(baseApi.util.resetApiState());
        const result = await store.dispatch(
          authApi.endpoints.login.initiate({
            email: email.value,
            password: password.value,
            rememberMe: keepMe,
            isMobileClient: false,
          }),
        );

        if ("error" in result) {
          setApiError(errorMessage(result));
          return;
        }
        handleSuccess();
      } catch {
        setApiError("Terjadi kesalahan sistem saat mencoba masuk.");
      } finally {
        setPending(false);
      }
    };

    const handleGoogleToken = async (/** @type {string} */ idToken) => {
      setApiError("");
      setPending(true);
      try {
        store.dispatch(baseApi.util.resetApiState());
        const result = await store.dispatch(
          authApi.endpoints.googleLogin.initiate({
            idToken,
            isMobileClient: false,
          }),
        );

        if ("error" in result) {
          setApiError(
            /** @type {any} */ (result.error)?.data?.message ||
              "Gagal verifikasi Google.",
          );
          return;
        }
        finish();
      } catch {
        setApiError("Gagal verifikasi Google.");
      } finally {
        setPending(false);
      }
    };

    const onGoogleClick = () => {
      if (pending) return;
      if (!GOOGLE_CLIENT_ID) {
        setApiError("VITE_GOOGLE_CLIENT_ID belum diset");
        return;
      }
      requestGoogleAccessToken(handleGoogleToken, setApiError);
    };

    /** @param {HTMLInputElement | null} input @param {string} name */
    const bindToggle = (input, name) => {
      const button = root.querySelector(`[data-ref="${name}"]`);
      if (!input || !button) return;
      button.addEventListener("click", () => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.textContent = show ? "Hide" : "Show";
      });
    };
    bindToggle(password, "togglePassword");
    bindToggle(confirmPassword, "toggleConfirmPassword");

    checkbox?.addEventListener("click", () => setKeepMe(!keepMe));

    const switchMode = (/** @type {AuthMode} */ next) => {
      mode = next;
      submitted = false;
      render();
    };
    root
      .querySelector('[data-ref="toRegister"]')
      ?.addEventListener("click", () => switchMode("register"));
    root
      .querySelector('[data-ref="toLogin"]')
      ?.addEventListener("click", () => switchMode("login"));

    // Setelah submit pertama, validasi ulang saat mengetik
    form.addEventListener("input", () => {
      if (submitted) showErrors(validate().errors);
    });
    form.addEventListener("submit", onSubmit);
    google.addEventListener("click", onGoogleClick);

    detachForm = () => {
      form.removeEventListener("submit", onSubmit);
      google.removeEventListener("click", onGoogleClick);
    };

    container.replaceChildren(root);
  }

  return () => {
    disposed = true;
    detachForm?.();
    profileRequest.unsubscribe?.();
    container.replaceChildren();
  };
}

/**
 * Versi halaman penuh (standalone): form di tengah layar.
 * @param {HTMLElement} container
 * @param {AuthOptions} [options]
 * @returns {() => void}
 */
export function mountAuthPage(container, options = {}) {
  const main = document.createElement("main");
  main.className =
    "flex min-h-screen items-center justify-center p-4 bg-zinc-50";
  container.replaceChildren(main);

  const cleanup = mountAuthForm(main, options);
  return () => {
    cleanup();
    container.replaceChildren();
  };
}
