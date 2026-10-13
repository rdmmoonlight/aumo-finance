import { cn } from "@/core/cn";
import { createDisposer, h, mount, on } from "@/core/dom";

export const GOOGLE_CLIENT_ID =
  (typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string) : "") ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

export type AuthMode = "login" | "register";
export type AuthOptions = {
  initialMode?: AuthMode;
  onSuccess?: (data: any) => void;
};

let gsiPromise: Promise<void> | null = null;
function ensureGsiScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google?.accounts?.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
  return gsiPromise;
}

export function renderAuthSkeleton(container: HTMLElement) {
  container.innerHTML = "";
  const el = h("div", { className: "w-full max-w-sm mx-auto p-6 border rounded-lg shadow-sm bg-card animate-pulse space-y-4" },
    h("div", { className: "h-7 bg-zinc-200 rounded w-2/3 mx-auto" }),
    h("div", { className: "h-4 bg-zinc-100 rounded w-full" }),
    h("div", { className: "h-10 bg-zinc-100 rounded" }),
    h("div", { className: "h-10 bg-zinc-100 rounded" }),
  );
  mount(container, el);
  return () => { container.innerHTML = ""; };
}

export function renderAuthForm(container: HTMLElement, opts: AuthOptions = {}) {
  const disposer = createDisposer();
  let currentMode: AuthMode = opts.initialMode || "login";

  const build = () => {
    disposer.clean();
    container.innerHTML = "";

    const isLogin = currentMode === "login";
    const titleEl = h("h1", { className: "text-2xl font-bold tracking-tight text-center mb-1" }, isLogin ? "Masuk ke Aumo" : "Daftar ke Aumo");
    const subtitleEl = h("p", { className: "text-sm text-muted-foreground text-center mb-6" }, isLogin ? "Masuk ke workspace kamu untuk melanjutkan." : "Buat workspace baru untuk memulai.");

    const emailInput = h("input", {
      type: "email", name: "email", placeholder: "nama@perusahaan.com", autocomplete: "email",
      className: cn("w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary", "border-input bg-background"),
      required: true,
    }) as HTMLInputElement;

    const passwordInput = h("input", {
      type: "password", name: "password", placeholder: "••••••••", autocomplete: isLogin ? "current-password" : "new-password",
      className: cn("w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary", "border-input bg-background"),
      required: true,
    }) as HTMLInputElement;

    const submitButton = h("button", { type: "submit", className: cn("w-full py-2 px-4 rounded-md font-medium text-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors") }, isLogin ? "Masuk" : "Daftar");
    const divider = h("div", { className: "relative my-2" },
      h("div", { className: "absolute inset-0 flex items-center" }, h("div", { className: "w-full border-t" })),
      h("div", { className: "relative flex justify-center text-xs uppercase" }, h("span", { className: "bg-card px-2 text-muted-foreground" }, "atau"))
    );
    const googleWrap = h("div", { className: "w-full flex justify-center min-h-", id: `g_id_${Math.random().toString(36).slice(2)}` });
    const toggleBtn = h("button", { type: "button", className: "font-semibold text-primary hover:underline ml-1" }, isLogin ? "Daftar" : "Masuk");
    const toggleWrap = h("p", { className: "text-center text-xs text-muted-foreground mt-2" }, isLogin ? "Belum punya akun? " : "Sudah punya akun? ", toggleBtn);

    const form = h("form", { className: "space-y-4 max-w-sm mx-auto p-6 border rounded-lg shadow-sm bg-card w-full" },
      titleEl, subtitleEl,
      h("div", { className: "space-y-1" }, h("label", { className: "text-xs font-semibold uppercase" }, "Email"), emailInput),
      h("div", { className: "space-y-1" }, h("label", { className: "text-xs font-semibold uppercase" }, "Kata Sandi"), passwordInput),
      submitButton, divider, googleWrap, toggleWrap
    );

    mount(container, form);

    disposer.add(on(form, "submit", async (e: SubmitEvent) => {
      e.preventDefault();
      const payload = { email: emailInput.value, password: passwordInput.value, mode: currentMode };
      console.log(`${currentMode} Payload:`, payload);
      opts.onSuccess?.(payload);
    }));

    disposer.add(on(toggleBtn, "click", () => {
      currentMode = currentMode === "login" ? "register" : "login";
      build();
    }));

    ensureGsiScript().then(() => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res: any) => {
          console.log("Google Payload:", res);
          opts.onSuccess?.(res);
        },
      });
      g.accounts.id.renderButton(googleWrap, { theme: "outline", size: "large", width: 320, text: isLogin ? "signin_with" : "signup_with" });
    });
  };

  build();
  return () => { disposer.clean(); container.innerHTML = ""; };
}

export function renderLoginPage(container: HTMLElement, opts: Omit<AuthOptions, "initialMode"> = {}) {
  return renderAuthForm(container, { initialMode: "login", ...opts });
}

export function renderRegisterPage(container: HTMLElement, opts: Omit<AuthOptions, "initialMode"> = {}) {
  return renderAuthForm(container, { initialMode: "register", ...opts });
}