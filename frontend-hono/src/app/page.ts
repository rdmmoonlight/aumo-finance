import mountLogin from "@/app/auth/login";
import mountRegister from "@/app/auth/register";
import { cn } from "@/core/cn";
import { createDisposer, h, mount, on } from "@/core/dom";
import { store } from "@/lib/store";
import { authApi } from "@/lib/store/auth/authApi";

export function renderLandingPage(container: HTMLElement) {
  const disposer = createDisposer();
  container.innerHTML = "";
  document.title = "Aumo Finance | Operations, neatly organized.";

  let active = true;
  let dialogCleanup: (() => void) | null = null;
  let authMode: "login" | "register" = "login";

  const navigate = (path: string, opts?: { replace?: boolean }) => {
    if (opts?.replace) window.location.replace(path);
    else window.location.href = path;
  };

  // --- Splash Loader ---
  const renderSplash = (text: string) => {
    container.innerHTML = "";
    const el = h("div", { className: "flex min-h-screen w-full items-center justify-center bg-black text-white" },
      h("div", { className: "flex items-center gap-3 text-sm text-zinc-400" },
        h("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" }),
        h("span", {}, text)
      )
    );
    mount(container, el);
  };

  // --- Auth Check (tanpa React) ---
  const checkAuth = async () => {
    renderSplash("Memeriksa sesi...");
    // @ts-ignore RTK Query initiate return promise with unsubscribe
    const promise: any = store.dispatch(authApi.endpoints.getProfile.initiate());
    try {
      const result = await promise;
      if (!active) return;
      if (result.isSuccess && result.data?.success) {
        renderSplash("Redirecting to dashboard...");
        navigate("/home", { replace: true });
        return;
      }
      buildLanding();
    } catch {
      if (active) buildLanding();
    } finally {
      promise?.unsubscribe?.();
    }
  };

  // --- Build Landing ---
  const buildLanding = () => {
    if (!active) return;
    disposer.clean();
    container.innerHTML = "";

    // LEFT
    const leftPanel = h("div", { className: "flex flex-col justify-between border-r border-zinc-800 bg-zinc-950 p-8 lg:p-12" },
      h("div", { className: "flex items-center gap-3" },
        h("div", { className: "flex h-8 w-8 items-center justify-center rounded bg-white font-bold text-black" }, "A"),
        h("span", { className: "text-sm font-semibold tracking-tight" }, "AUMO FINANCE")
      ),
      h("div", { className: "mt-12 lg:mt-0" },
        h("h1", { className: "max-w-lg text-5xl font-semibold leading-[0.95] tracking-[-0.03em]" }, "Operations,", h("br"), " neatly", h("br"), " organized."),
        h("p", { className: "mt-6 max-w-sm text-sm leading-6 text-zinc-400" }, "Matte, tenang, tanpa distraksi. Dibuat untuk produksi, bukan pameran."),
        h("div", { className: "mt-12 border-t border-zinc-800" },
          h("div", { className: "flex justify-between border-b border-zinc-800 py-4 text-xs" }, h("span", { className: "font-mono text-zinc-500" }, "01"), h("span", {}, "Revenues & Expenses")),
          h("div", { className: "flex justify-between border-b border-zinc-800 py-4 text-xs" }, h("span", { className: "font-mono text-zinc-500" }, "02"), h("span", {}, "Tracking")),
          h("div", { className: "flex justify-between border-b border-zinc-800 py-4 text-xs" }, h("span", { className: "font-mono text-zinc-500" }, "03"), h("span", {}, "Finance & Costings"))
        )
      ),
      h("div", { className: "hidden justify-between font-mono text-xs text-zinc-500 lg:flex" },
        h("span", {}, "© rdmmoonlight 2026"),
        h("span", {}, "COOKIE AUTH • AUMO SYSTEM")
      )
    );

    // RIGHT
    const btnLogin = h("button", { className: cn("flex-1 w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white text-sm font-medium text-black hover:bg-zinc-200") },
      h("span", {}, "Sign In"), h("span", {}, "→")
    );
    const btnRegister = h("button", { className: cn("flex-1 w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800") },
      h("span", {}, "Register")
    );

    const rightPanel = h("div", { className: "flex flex-col items-center justify-center gap-6 bg-black p-6 lg:p-12" },
      h("div", { className: "max-w-sm text-center" },
        h("h2", { className: "text-2xl font-semibold tracking-tight" }, "Selamat Datang"),
        h("p", { className: "mt-2 text-sm text-zinc-400" }, "Silakan masuk atau buat akun baru untuk mengakses dashboard.")
      ),
      h("div", { className: "flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm" }, btnLogin, btnRegister)
    );

    const grid = h("div", { className: "grid min-h-screen w-full bg-black text-white lg:grid-cols-[1.15fr_1fr]" }, leftPanel, rightPanel);

    // MODAL VANILLA (ganti Dialog)
    const overlay = h("div", { className: "fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-sm p-4" });
    const dialog = h("div", { className: "mx-auto mt-20 w-full sm:max-w-md rounded-xl border border-zinc-800 bg-zinc-950 text-white overflow-hidden shadow-xl" });
    const header = h("div", { className: "flex items-center justify-between p-6 pb-0" },
      h("h3", { className: "text-lg font-medium text-zinc-100", id: "auth-title" }, "Sign In to Aumo"),
      h("button", { className: "text-zinc-500 hover:text-white text-2xl leading-none px-2" }, "×")
    );
    const body = h("div", { className: "p-6 pt-4", id: "auth-mount" });
    dialog.append(header, body);
    mount(overlay, dialog);
    mount(container, grid);
    container.appendChild(overlay);

    const titleEl = header.querySelector("#auth-title") as HTMLElement;
    const mountEl = body as HTMLElement;
    const closeBtn = header.querySelector("button") as HTMLElement;

    const handleSuccess = () => {
      closeModal();
      navigate("/home", { replace: true });
    };

    const openModal = (mode: "login" | "register") => {
      authMode = mode;
      titleEl.textContent = mode === "login" ? "Sign In to Aumo" : "Create an Account";
      overlay.classList.remove("hidden");
      overlay.classList.add("flex", "items-center", "justify-center");
      mountEl.innerHTML = "";
      if (dialogCleanup) dialogCleanup();
      dialogCleanup = mode === "login"
        ? (mountLogin(mountEl, { onSuccess: handleSuccess }) as any)
        : (mountRegister(mountEl, { onSuccess: handleSuccess }) as any);
    };

    const closeModal = () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("flex", "items-center", "justify-center");
      if (dialogCleanup) { dialogCleanup(); dialogCleanup = null; }
      mountEl.innerHTML = "";
    };

    disposer.add(on(btnLogin, "click", () => openModal("login")));
    disposer.add(on(btnRegister, "click", () => openModal("register")));
    disposer.add(on(closeBtn, "click", closeModal));
    disposer.add(on(overlay, "click", (e: MouseEvent) => { if (e.target === overlay) closeModal(); }));
    disposer.add(on(window, "keydown", (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); }));
  };

  checkAuth();

  return () => {
    active = false;
    disposer.clean();
    if (dialogCleanup) dialogCleanup();
    container.innerHTML = "";
  };
}

export default renderLandingPage;