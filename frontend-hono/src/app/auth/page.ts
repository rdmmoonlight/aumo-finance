import { renderLoginPage } from "./auth";

export function renderAuthPage(container: HTMLElement) {
  return renderLoginPage(container);
}
export default renderAuthPage;

// auto-mount buat pure HTML tanpa Next.js
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("auth-root") as HTMLElement;
    if (el) renderAuthPage(el);
  });
}