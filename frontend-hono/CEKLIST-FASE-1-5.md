# Ceklist Pemeriksaan Fase 1–5 — `frontend-hono`

Tanggal periksa: 12 Okt 2026 · Acuan: `MIGRASI-VANILLA-VITE.md`
Metode: baca kode + jalankan `tsc --noEmit`, `vitest run`, `vite build` (pnpm, `--frozen-lockfile`).

## Ringkasan Neraca

| Pemeriksaan | Hasil |
|-------------|-------|
| File `.tsx` tersisa | 69 (awal 98; berkurang 29) |
| `tsc --noEmit` | **GAGAL** — 931 error |
| `vite build` | **GAGAL** — 79 error (5 ekspor hilang) |
| Unit test | 6 lulus, **5 gagal** (`api-parity`) |
| Status Fase 5 `[✓]` pada dokumen | **Belum layak** |

Kesimpulan: Fase 1–3 sebagian besar selesai. Fase 4–5 berisi file pengganti, tetapi build rusak karena TSX UI sudah dihapus sementara halaman React masih memakainya.

---

## Fase 1 — Baseline & Pembersihan Sisa Next.js
- [x] Tag git `pre-vanilla-migration` (di `fe790548`, commit terakhir sebelum `src/core`)
- [x] Smoke test rute (`src/tests/smoke.spec.ts`)
- [x] Smoke test valid: `baseURL` ke `http://localhost:3000`; asersi cek `#root` terisi dan tanpa galat JS
- [x] Daftar rute (`ROUTE-CHECKLIST.md`)
- [x] Direktif `"use client"` dihapus (0 sisa)
- [x] `eslint-config-next` dihapus
- [x] Plugin `"next"`, `next-env.d.ts`, `.next/types/**` dihapus dari `tsconfig.json`
- [x] `eslint.config.mjs` tidak lagi memuat `@next/eslint-plugin-next` (sebelumnya `npm run lint` gagal); lint kini lulus
- [x] Komentar `next/headers` dihapus dari `src/lib/apiClient.ts`
- [x] Satu lockfile (`pnpm-lock.yaml`)
- [x] `tsconfig.tsbuildinfo` dan `test-results/` di `.gitignore`, tidak ter-track
- [x] `playwright-report/` di `.gitignore` dan dilepas dari git
- [x] `@react-oauth/google` dihapus
- [x] Paket `cn` dihapus (tanpa pemakai)
- [x] `vite.config.ts`: `server.proxy` `/api` memakai `backendTarget`
- [ ] Gerbang: build hijau — masih gagal; penyebab bukan Fase 1, melainkan 5 ekspor hilang dari Fase 5 (`TabsList/TabsTrigger/TabsContent`, `SelectContent/SelectItem`)

## Fase 2 — Fondasi Runtime (`src/core/`)
- [x] `dom.js` (`h`, `mount`, `on`, `createDisposer`, `isMobile`)
- [x] `cn.js`
- [x] `format.js` (Rupiah, tanggal)
- [x] `README.md` kontrak halaman
- [x] Unit test `core` (6 lulus)
- [x] Halaman auth memakai `core/`
- [ ] `format.ts` yang tersebar di `reports/*/_lib` belum digabung (4 file masih terpisah)

## Fase 3 — Lapisan Data Baru
- [x] `core/store.js` (cache, dedupe, invalidasi)
- [x] 10 modul `src/api/*` (auth, chart-of-accounts, common, dashboard, home, journal-entry, periods, reports, settings, tools)
- [x] Cabang SSR dibuang dari klien baru
- [x] Slice RTK lama dipertahankan
- [ ] Ekstensi sesuai rencana `.js`: semua modul berekstensi `.ts` tetapi berisi kode JS tanpa tipe → ±58 error `tsc` di `src/api/*`
- [ ] Uji perbandingan lulus: 5 dari 5 tes `api-parity` gagal (RTK Query di Node menolak URL relatif `/periods`; hasil RTK `undefined`) → uji tidak valid, bukan bukti paritas

## Fase 4 — Komponen UI Statis (12)
- [x] 12 file `.js`: alert, avatar, badge, breadcrumb, button, card, input, label, separator, skeleton, table, textarea
- [x] Varian lewat `cva`
- [ ] Mengembalikan elemen DOM lewat `h()` (kontrak keputusan #3): saat ini mengembalikan **string HTML**
- [ ] Katalog `/__ui`: `src/pages/ui-catalog.js` ada, tetapi tidak terdaftar di router (tidak bisa dibuka)
- [ ] TSX pasangan dihapus hanya bila tanpa pemakai React: sudah dihapus, padahal halaman React masih memakainya

## Fase 5 — Komponen UI Interaktif (15)
- [x] 15 file ada: dialog, alert-dialog, sheet, popover, tooltip, dropdown-menu, select, tabs, toggle, toggle-group, radio-group, checkbox, collapsible, scroll-area, navigation-menu
- [ ] `tabs.js` tanpa `TabsList`, `TabsTrigger`, `TabsContent` (dipakai `settings/page.tsx`)
- [ ] `select.js` tanpa `SelectContent`, `SelectItem`
- [ ] `@floating-ui/dom` tidak terpasang; popover/tooltip/dropdown tanpa posisi dinamis
- [ ] Aturan 5 (data tidak lewat `innerHTML`): semua komponen menyisipkan `${title}`, `${content}`, `${label}` tanpa escape → celah XSS
- [ ] Handler `onclick="..."` inline dengan `id` terinterpolasi
- [ ] Uji keyboard cakupan penuh: `ui-keyboard.spec.js` hanya 4 tes (dialog, popover/dropdown, collapsible, sidebar); tabs, select, radio, checkbox, toggle, tooltip belum diuji
- [ ] Fokus kembali ke pemicu terverifikasi untuk sheet dan alert-dialog
- [ ] Gerbang: `typecheck && build && test:e2e` lulus (gagal)

---

## Urutan Perbaikan (prioritas)

1. Pulihkan build: tambahkan ekspor `TabsList/TabsTrigger/TabsContent`, `SelectContent/SelectItem`, atau kembalikan TSX UI sampai Fase 14.
2. Ubah komponen Fase 4–5 menjadi `h()` (elemen DOM), buang interpolasi string HTML.
3. Rapikan `src/api/*`: ganti ke `.js` + JSDoc, atau beri tipe; target `tsc` 0 error.
4. Perbaiki `api-parity.test.js`: pakai URL absolut dan `fetch` mock.
5. Daftarkan `/__ui` di router; lengkapi uji keyboard.
6. Selesaikan sisa Fase 1: tag git, `playwright-report` ke `.gitignore`, `tsconfig.json`, hapus `cn`, `baseURL` Playwright.
7. Setelah semua di atas hijau, baru tandai Fase 5 `[✓]`.
