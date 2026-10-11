import mountLogin from "./login/index.js";

/** Halaman /auth (vanilla). Dipasang oleh router lewat page.{ts,js}. */
export default function AuthPage(container, ctx) {
  return mountLogin(container, { query: ctx?.query });
}
