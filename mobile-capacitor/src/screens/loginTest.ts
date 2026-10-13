import { h } from '../core/dom';
import { createButton, createCard, createInput } from '../components/ui';
import type { SignInResult } from '../auth/authService';

export type SignInFn = (params: {
  email: string;
  password: string;
  keepSignedIn: boolean;
  enableBiometric: boolean;
}) => Promise<SignInResult>;

/**
 * Uji koneksi Fase 4: memanggil login API sungguhan dari perangkat.
 * Dihapus saat layar Login (Fase 5) selesai.
 */
export function createLoginTest(signIn: SignInFn): HTMLElement {
  const email = createInput({ label: 'Email', type: 'email', autocomplete: 'username' });
  const password = createInput({
    label: 'Kata sandi',
    type: 'password',
    autocomplete: 'current-password',
  });
  const keep = h('input', { type: 'checkbox', class: 'size-icon-sm accent-primary' });
  const result = h('p', { class: 'text-secondary', role: 'status' });
  const resultCard = createCard({ elevated: true }, result);
  resultCard.hidden = true;

  const submit = createButton({ fullWidth: true, disabled: true }, 'Masuk');

  const refresh = () => {
    submit.disabled = email.input.value === '' || password.input.value === '';
  };
  email.input.addEventListener('input', refresh);
  password.input.addEventListener('input', refresh);

  submit.addEventListener('click', () => {
    void (async () => {
      submit.disabled = true;
      submit.textContent = 'Memproses...';
      resultCard.hidden = true;
      const outcome = await signIn({
        email: email.input.value,
        password: password.input.value,
        keepSignedIn: keep.checked,
        enableBiometric: false,
      });
      result.textContent = outcome.ok
        ? `Berhasil masuk: ${outcome.fullName}`
        : `Gagal: ${outcome.message}`;
      resultCard.hidden = false;
      submit.textContent = 'Masuk';
      refresh();
    })();
  });

  return h(
    'div',
    { class: 'flex flex-col gap-lg' },
    email.el,
    password.el,
    h('label', { class: 'flex min-h-button items-center gap-sm text-body' }, keep, 'Ingat saya'),
    submit,
    resultCard
  );
}
