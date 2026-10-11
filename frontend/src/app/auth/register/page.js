import mountRegister from "./index.js";

/** Halaman /auth/register (vanilla). */
export default function RegisterPage(container, ctx) {
  return mountRegister(container, { query: ctx?.query });
}
