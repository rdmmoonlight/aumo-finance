import { AuthOptions, renderAuthForm } from "../auth";

export function renderRegisterPage(container: HTMLElement, opts: Omit<AuthOptions, "initialMode"> = {}) {
  return renderAuthForm(container, { initialMode: "register", ...opts });
}
export default renderRegisterPage;