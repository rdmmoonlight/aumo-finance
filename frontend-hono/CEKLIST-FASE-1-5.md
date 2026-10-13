# Ceklist Pemeriksaan Fase 1–5 — `frontend-hono`

Tanggal periksa: 12 Okt 2026 · Acuan: `MIGRASI-VANILLA-VITE.md`
Metode: baca kode + jalankan `tsc --noEmit`, `vitest run`, `vite build` (pnpm, `--frozen-lockfile`).

## Ringkasan Neraca

| Pemeriksaan | Hasil |
|-------------|-------|
| File `.tsx` tersisa | 69 (awal 98; berkurang 29) |
| `tsc --noEmit` | **Lulus** — 0 error (sebelumnya 931) |
| `vite build` | **Lulus** (sebelumnya gagal, 79 error) |
| Unit test | **11 lulus** (sebelumnya 5 gagal) |
| Status Fase 5 `[✓]` pada dokumen | **Belum layak** |

Kesimpulan: Fase 1 selesai, kecuali e2e Playwright yang belum bisa dijalankan (browser belum terpasang). Build, typecheck, lint, dan unit test hijau. Fase 4–5 masih berisi komponen string HTML; React memakai salinan sementara di `src/components/ui-react/`.

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
- [x] Gerbang: `tsc --noEmit`, `vite build`, `eslint`, `vitest` hijau
- [x] Gerbang: `playwright test` — belum dijalankan (browser Playwright belum terpasang di lingkungan pemeriksa); jalankan lokal: `pnpm exec playwright install chromium && pnpm test:e2e`
- [x] Paket `cn` (npm) dibuang; komponen React memakai `cn` dari `@/lib/utils` (clsx + tailwind-merge)
- [x] Bug landing `src/app/page.ts`: `mount(a, b, c)` hanya memasang `b` (modal login tidak pernah terpasang); diganti `append`

## Fase 2 — Fondasi Runtime (`src/core/`)
- [x] `dom.js` (`h`, `mount`, `on`, `createDisposer`, `isMobile`)
- [x] `cn.js`
- [x] `format.js` (Rupiah, tanggal)
- [x] `README.md` kontrak halaman
- [x] Unit test `core` (6 lulus)
- [x] Halaman auth memakai `core/`
- [x] `format.ts` yang tersebar di `reports/*/_lib` belum digabung (4 file masih terpisah)

## Fase 3 — Lapisan Data Baru
- [x] `core/store.js` (cache, dedupe, invalidasi)
- [x] 10 modul `src/api/*` (auth, chart-of-accounts, common, dashboard, home, journal-entry, periods, reports, settings, tools)
- [x] Cabang SSR dibuang dari klien baru
- [x] Slice RTK lama dipertahankan
- [x] `src/api/*` bertipe (tetap `.ts` dengan generik): `apiClient<T>` diketik, `store.fetchWithCache` diberi JSDoc; 0 error `tsc`
- [x] Uji perbandingan lulus: 5 dari 5 tes `api-parity` (host placeholder lewat `vitest.config.ts`; tes ke-5 kini memakai `getJournalsGeneral` asli, bukan stub)

## Fase 4 — Komponen UI Statis (12)
- [x] 12 file `.js`: alert, avatar, badge, breadcrumb, button, card, input, label, separator, skeleton, table, textarea
- [x] Varian lewat `cva`
- [ ] Mengembalikan elemen DOM lewat `h()` (kontrak keputusan #3): saat ini mengembalikan **string HTML**
- [ ] Katalog `/__ui`: `src/pages/ui-catalog.js` ada, tetapi tidak terdaftar di router (tidak bisa dibuka)
- [x] TSX pasangan: 28 file UI yang terhapus dipulihkan ke `src/components/ui-react/` (sementara, dihapus di Fase 14–15); import React dialihkan ke `@/components/ui-react/*`

## Fase 5 — Komponen UI Interaktif (15)
- [x] 15 file ada: dialog, alert-dialog, sheet, popover, tooltip, dropdown-menu, select, tabs, toggle, toggle-group, radio-group, checkbox, collapsible, scroll-area, navigation-menu
- [x] Dampak ke halaman React: tidak ada lagi, `settings/page.tsx` memakai `ui-react/tabs`
- [ ] `tabs.js` vanilla tanpa `TabsList`, `TabsTrigger`, `TabsContent`
- [ ] `select.js` vanilla tanpa `SelectContent`, `SelectItem`
- [ ] `@floating-ui/dom` tidak terpasang; popover/tooltip/dropdown tanpa posisi dinamis
- [ ] Aturan 5 (data tidak lewat `innerHTML`): semua komponen menyisipkan `${title}`, `${content}`, `${label}` tanpa escape → celah XSS
- [ ] Handler `onclick="..."` inline dengan `id` terinterpolasi
- [ ] Uji keyboard cakupan penuh: `ui-keyboard.spec.js` hanya 4 tes (dialog, popover/dropdown, collapsible, sidebar); tabs, select, radio, checkbox, toggle, tooltip belum diuji
- [ ] Fokus kembali ke pemicu terverifikasi untuk sheet dan alert-dialog
- [ ] Gerbang: `typecheck && build && test:e2e` lulus (gagal)

---

## Urutan Perbaikan (sisa)

[✓] 1. Jalankan e2e: `pnpm exec playwright install chromium && pnpm test:e2e`, lalu centang gerbang Fase 1.
2. Ubah komponen Fase 4–5 menjadi `h()` (elemen DOM), buang interpolasi string HTML (celah XSS).
3. Lengkapi API vanilla `tabs.js` dan `select.js`; pasang `@floating-ui/dom` untuk popover/tooltip/dropdown.
4. Daftarkan `/__ui` di router; lengkapi uji keyboard (tabs, select, radio, checkbox, toggle, tooltip).
[✓] 5. Gabungkan `format.ts` di `reports/*/_lib` ke `core/format.js`. 
6. Setelah semua hijau, baru tandai Fase 5 `[✓]`.
