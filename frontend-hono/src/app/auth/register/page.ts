import { renderRegisterPage } from "./index";

export function renderRegisterPageEntry(container: HTMLElement) {
  return renderRegisterPage(container);
}
export default renderRegisterPageEntry;

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("register-page") as HTMLElement || document.querySelector("[data-page='register']") as HTMLElement;
    if (el) renderRegisterPage(el);
  });
}