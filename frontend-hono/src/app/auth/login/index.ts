import { AuthOptions, renderAuthForm } from "../auth";

export function renderLoginPage(container: HTMLElement, opts: Omit<AuthOptions, "initialMode"> = {}) {
  return renderAuthForm(container, { initialMode: "login", ...opts });
}
export default renderLoginPage;