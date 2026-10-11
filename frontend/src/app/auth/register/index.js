import { mountAuthForm, mountAuthPage } from "../auth.js";

/**
 * Register. Dengan `onSuccess` dipakai sebagai isi modal, tanpa itu sebagai halaman penuh.
 * @param {HTMLElement} container
 * @param {import("../auth.js").AuthOptions} [options]
 * @returns {() => void}
 */
export default function mountRegister(container, options = {}) {
  const opts = { ...options, initialMode: options.initialMode ?? "register" };
  return options.onSuccess
    ? mountAuthForm(container, opts)
    : mountAuthPage(container, opts);
}
