import { renderLoginPage } from "./index";

export function renderLoginPageEntry(container: HTMLElement) {
  return renderLoginPage(container);
}
export default renderLoginPageEntry;

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("login-page") as HTMLElement || document.querySelector("[data-page='login']") as HTMLElement;
    if (el) renderLoginPage(el);
  });
}