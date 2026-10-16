// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountCatalog } from './catalog';
import { mountCrashLog } from './crashLog';

afterEach(() => {
  document.body.replaceChildren();
});

describe('mountCatalog', () => {
  it('menampilkan semua bagian katalog dan tidak memuat HTML mentah', () => {
    const root = document.createElement('div');
    document.body.append(root);
    const cleanup = mountCatalog(root, { onOpenCrashLog: vi.fn(), signIn: vi.fn() });
    const headings = [...root.querySelectorAll('h2')].map((el) => el.textContent);
    expect(headings).toEqual(
      expect.arrayContaining([
        'Tombol',
        'Input',
        'Card',
        'List',
        'Skeleton',
        'Tipografi',
        'Warna',
        'Uji Login API (Fase 4)',
      ])
    );
    expect(root.querySelectorAll('svg').length).toBeGreaterThan(0);
    cleanup();
  });

  it('tombol "Buka Log" memanggil onOpenCrashLog', () => {
    const root = document.createElement('div');
    const onOpenCrashLog = vi.fn();
    mountCatalog(root, { onOpenCrashLog, signIn: vi.fn() });
    const button = [...root.querySelectorAll('button')].find((b) => b.textContent === 'Buka Log');
    button?.click();
    expect(onOpenCrashLog).toHaveBeenCalledOnce();
  });

  it('uji login: tombol Masuk aktif setelah email dan sandi terisi, hasil ditampilkan', async () => {
    const root = document.createElement('div');
    const signIn = vi.fn().mockResolvedValue({ ok: true, fullName: 'Ghofur' });
    mountCatalog(root, { onOpenCrashLog: vi.fn(), signIn });

    const submit = [...root.querySelectorAll('button')].find((b) => b.textContent === 'Masuk');
    const email = root.querySelector<HTMLInputElement>('input[type="email"]');
    const password = root.querySelector<HTMLInputElement>('input[type="password"]');
    const keep = root.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (!submit || !email || !password || !keep)
      throw new Error('elemen uji login tidak ditemukan');

    expect(submit.disabled).toBe(true);
    email.value = 'a@b.c';
    email.dispatchEvent(new Event('input'));
    password.value = 'rahasia';
    password.dispatchEvent(new Event('input'));
    expect(submit.disabled).toBe(false);

    keep.checked = true;
    submit.click();
    await vi.waitFor(() => {
      expect(root.querySelector('[role="status"]:not([aria-live])')?.textContent).toBe(
        'Berhasil masuk: Ghofur'
      );
    });
    expect(signIn).toHaveBeenCalledWith({
      email: 'a@b.c',
      password: 'rahasia',
      keepSignedIn: true,
      enableBiometric: false,
    });
    expect(submit.textContent).toBe('Masuk');
  });

  it('pesan gagal dari login ditampilkan sebagai teks biasa', async () => {
    const root = document.createElement('div');
    const signIn = vi.fn().mockResolvedValue({ ok: false, message: '<b>salah</b>' });
    mountCatalog(root, { onOpenCrashLog: vi.fn(), signIn });
    const submit = [...root.querySelectorAll('button')].find((b) => b.textContent === 'Masuk');
    const email = root.querySelector<HTMLInputElement>('input[type="email"]');
    const password = root.querySelector<HTMLInputElement>('input[type="password"]');
    if (!submit || !email || !password) throw new Error('elemen tidak ditemukan');
    email.value = 'a';
    email.dispatchEvent(new Event('input'));
    password.value = 'b';
    password.dispatchEvent(new Event('input'));
    submit.click();
    await vi.waitFor(() => {
      expect(root.textContent).toContain('Gagal: <b>salah</b>');
    });
    expect(root.querySelector('b')).toBeNull();
  });
});

describe('mountCrashLog', () => {
  it('memuat log, lalu Clear Log mengosongkan dan memuat ulang', async () => {
    const root = document.createElement('div');
    let log = 'ERROR/HTTP: GET /x -> 500';
    const clearLog = vi.fn(() => {
      log = 'Belum ada log.';
      return Promise.resolve();
    });
    const onBack = vi.fn();
    const cleanup = mountCrashLog(root, { readLog: () => Promise.resolve(log), clearLog, onBack });

    await vi.waitFor(() => {
      expect(root.querySelector('pre')?.textContent).toBe('ERROR/HTTP: GET /x -> 500');
    });

    [...root.querySelectorAll('button')].find((b) => b.textContent === 'Clear Log')?.click();
    await vi.waitFor(() => {
      expect(root.querySelector('pre')?.textContent).toBe('Belum ada log.');
    });
    expect(clearLog).toHaveBeenCalledOnce();

    root.querySelector<HTMLButtonElement>('button[aria-label="Kembali"]')?.click();
    expect(onBack).toHaveBeenCalledOnce();
    cleanup();
  });

  it('Copy Log menyalin isi ke clipboard', async () => {
    const root = document.createElement('div');
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    mountCrashLog(root, {
      readLog: () => Promise.resolve('isi log'),
      clearLog: () => Promise.resolve(),
      onBack: vi.fn(),
    });
    await vi.waitFor(() => {
      expect(root.querySelector('pre')?.textContent).toBe('isi log');
    });
    [...root.querySelectorAll('button')].find((b) => b.textContent === 'Copy Log')?.click();
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('isi log');
    });
    vi.unstubAllGlobals();
  });
});
