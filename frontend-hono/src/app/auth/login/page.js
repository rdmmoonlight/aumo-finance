import mountLogin from "./index.js";

/** Halaman /auth/login (vanilla). */
export default function LoginPage(container, ctx) {
  return mountLogin(container, { query: ctx?.query });
}
