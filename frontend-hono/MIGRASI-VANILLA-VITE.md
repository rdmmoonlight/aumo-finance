# Peta Migrasi `frontend-hono`: React (TSX) → Vanilla JS + Vite

Cakupan: folder `frontend-hono/` pada monorepo `rdmmoonlight/aumo-finance`.
Status dokumen: **pemetaan saja, belum ada eksekusi.**
Target akhir: **0 file `.tsx`**, 0 dependensi React/Redux/Radix, bundel Vite murni.

---

## 1. Keputusan Utama

| No | Keputusan | Pilihan |
|----|-----------|---------|
| 1 | Strategi | Bertahap (strangler): halaman React dan vanilla hidup berdampingan sampai fase 15 |
| 2 | Bahasa | File UI baru `.js` + JSDoc. File logika `.ts` non-UI yang sudah ada **dipertahankan**; `tsc` tetap dipakai sebagai pengecek |
| 3 | Render | Fungsi `h(tag, props, ...children)` yang membuat elemen DOM. Teks selalu lewat `textContent` (anti-XSS) |
| 4 | Kontrak halaman | `export default function Page(container, ctx) { ...; return cleanup }` (sudah didukung `router.tsx`) |
| 5 | Router | Navigo tetap dipakai |
| 6 | State & data | RTK Query diganti `api.js` + `store.js` kecil (cache, dedupe, invalidasi tag) |
| 7 | CSS | Tailwind 4 tetap. `clsx`, `tailwind-merge`, `class-variance-authority` tetap (tidak terikat React) |
| 8 | Biaya | Rp0 tambahan. Semua pustaka gratis; deploy tetap Vercel |

---

## 2. Kondisi Saat Ini (hasil pemeriksaan repo)

**Stack aktual:** Vite 8, React 19, Navigo 8, Redux Toolkit/RTK Query, Tailwind 4, shadcn/ui (`radix-ui`), TanStack Table, Chart.js, zod, react-hook-form.

> Catatan: folder ini **sudah bukan Next.js**. Sisa jejaknya: `eslint-config-next`, plugin `"next"` di `tsconfig.json`, direktif `"use client"`, `next-themes`, dan komentar `next/headers` di `apiClient.ts`.

**Sudah vanilla:** `src/app/auth/` (`auth.js`, `login/`, `register/`, `auth.html`). Router sudah membaca `page.{ts,js}`; jembatan `VanillaMount` sudah ada. Pola ini diperluas ke seluruh aplikasi.

**Saldo awal TSX:** 98 file / 15.650 baris.

| Kelompok | File TSX | Baris |
|----------|---------:|------:|
| `components/ui/*` | 28 | 3.070 |
| Halaman `(authenticated)/*` | 60 | ±10.935 |
| Shell & infra (`main`, `router`, `layout`, sidebar, topbar, footer, providers, `vanilla-mount`, `app/page`) | 10 | sisa |
| **Total** | **98** | **15.650** |

**Temuan yang harus ditangani:**

1. `vite.config.ts` menghitung `backendTarget` tetapi **tidak memakainya** (tidak ada `server.proxy`). Padahal `apiClient.ts` mengandalkan proxy saat `VITE_WEB_API_URL` kosong. Dev lokal tanpa env gagal. → Fase 1 & 3.
2. `apiClient.ts` memuat cabang SSR (`typeof window === "undefined"`) yang tidak pernah berjalan pada SPA. → Fase 3.
3. Bila `page.tsx` dan `page.js` ada pada path yang sama, router **memenangkan React**. → Aturan 4.1 di bawah.
4. Dua lockfile (`package-lock.json` dan `pnpm-lock.yaml`). → Fase 1.
5. `tsconfig.tsbuildinfo` (±155 KB) dan `test-results/` ikut ter-commit. → Fase 1.
6. `@react-oauth/google` terpasang, tetapi tidak ditemukan importnya di `src/` (login Google sudah memakai skrip GSI langsung). → Fase 1.

---

## 3. Pemetaan Teknologi (React → Vanilla)

| Sekarang | Pengganti | Catatan |
|----------|-----------|---------|
| `react`, `react-dom`, JSX | `h()` + template DOM + `core/dom.js` | Nol framework |
| `react-redux`, `@reduxjs/toolkit` (RTK Query) | `api/client.js` + `core/store.js` | `fetch`, `credentials: "include"`, redirect 401 |
| `lib/router.tsx` (`Link`, `useLocation`, `useNavigate`, `useSearchParams`) | `lib/router.js` | Navigo + delegasi klik `a[data-link]` |
| `radix-ui` (22 impor) | `<dialog>`, `<details>`, Popover API/ARIA, `@floating-ui/dom` untuk posisi | Lihat Fase 5 |
| `lucide-react` (54 impor) | paket `lucide` (vanilla), impor per ikon | Tree-shaking tetap |
| `@tanstack/react-table` (22 impor) | `@tanstack/table-core` | Logika sort/filter/paging sama |
| `react-chartjs-2` | `chart.js` langsung | 1 pemakai (dashboard) |
| `react-hook-form` + `@hookform/resolvers` | `core/form.js` (`FormData` + `zod`) | `zod` tetap |
| `next-themes` | `core/theme.js` | Kelas `dark` pada `<html>` + `localStorage` + `matchMedia` |
| `hooks/use-mobile.ts` | `matchMedia` di `core/dom.js` | |
| `xlsx` | tetap | Tidak terikat React |

---

## 4. Aturan Main

1. **Satu commit per halaman:** buat `page.js` dan hapus `page.tsx` pada commit yang sama (React menang bila keduanya ada).
2. Nama file dipertahankan: `X.tsx` → `X.js`; `page.tsx` → `page.js`. Struktur folder tidak berubah.
3. Gerbang tiap fase: `npm run typecheck && npm run build && npm run test:e2e` harus lulus sebelum fase berikutnya.
4. Perilaku harus identik: rute, teks, validasi, format Rupiah/tanggal, dan panggilan API tidak berubah.
5. Data pengguna **tidak boleh** masuk lewat `innerHTML`. Hanya `textContent` / atribut.
6. Pembersihan (`cleanup`) wajib dikembalikan oleh setiap halaman: listener, timer, instance Chart.js.
7. Slice RTK lama tetap hidup sampai halaman terakhir yang memakainya pindah (dihapus di Fase 15).

---

## 5. Neraca Fase (Buku Besar TSX)

| Fase | Cakupan | TSX dihapus | Sisa TSX |
|-----:|---------|------------:|---------:|
| 0 | Saldo awal | – | 98 |
| 1 | Baseline & pembersihan sisa Next.js | 0 | 98 |
| 2 | Fondasi runtime (`core/`) | 0 | 98 |
| 3 | Lapisan data (pengganti RTK Query) | 0 | 98 |
| 4 | Komponen UI statis | 12 | 86 |
| 5 | Komponen UI interaktif | 15 | 71 |
| 6 | Helper form, tabel, grafik | 0 | 71 |
| 7 | Home + Dashboard | 6 | 65 |
| 8 | Chart of Accounts + AI Assistant | 4 | 61 |
| 9 | Periode + Jurnal Entry | 6 | 55 |
| 10 | Tools + Pengaturan | 9 | 46 |
| 11 | Laporan: Hub + Jurnal + Buku Besar | 16 | 30 |
| 12 | Laporan: Neraca Saldo + Worksheet | 8 | 22 |
| 13 | Laporan Keuangan | 11 | 11 |
| 14 | Shell aplikasi | 6 | 5 |
| 15 | Landing + router murni + lepas React | 5 | **0** |
| 16 | Pembersihan dependensi & hardening | 0 | **0** |

---

## 6. Rincian 16 Fase

### Fase 1 — Baseline & Pembersihan Sisa Next.js
**Tujuan:** titik awal aman dan repo bersih.
- Tag git `pre-vanilla-migration`.
- Perluas Playwright (`playwright.config.ts` sudah ada): smoke test tiap rute (login → home → dashboard → periode → laporan).
- Buat daftar rute dari `import.meta.glob` sebagai checklist.
- Hapus `eslint-config-next`, plugin `"next"` di `tsconfig.json`, direktif `"use client"`, komentar `next/headers`.
- Pilih **satu** lockfile; hapus yang lain.
- Hapus `tsconfig.tsbuildinfo` dan `test-results/` dari git; tambahkan ke `.gitignore`.
- Hapus dependensi tak terpakai (`@react-oauth/google`; periksa `cn`).
- Perbaiki `vite.config.ts`: pakai `backendTarget` untuk `server.proxy` `/api`.

**Selesai bila:** build hijau, smoke test hijau, tidak ada perubahan perilaku.

### Fase 2 — Fondasi Runtime Vanilla (`src/core/`)
**Tujuan:** perkakas dasar pengganti React.
- `dom.js`: `h()`, `mount()`, `on()` (dengan pelepasan otomatis), `disposer()`, `isMobile()`.
- `cn.js`: `clsx` + `twMerge` (kelanjutan `lib/utils.ts`).
- `cva` dipakai langsung untuk varian.
- `format.js`: Rupiah, tanggal, angka (gabungkan `format.ts` yang tersebar di `reports/*/_lib`).
- Dokumentasikan kontrak halaman dan konvensi komponen.

**Selesai bila:** `core/` punya uji unit ringan; halaman auth (sudah vanilla) memakainya tanpa regresi.

### Fase 3 — Lapisan Data Baru (pengganti RTK Query)
**Tujuan:** akses API tanpa Redux.
- `api/client.js`: `fetch`, `credentials: "include"`, `FormData` tanpa `Content-Type` manual, redirect 401 → `/auth`, buang cabang SSR.
- `core/store.js`: pub/sub kecil + cache TTL + dedupe request + `invalidate(tag)`.
- Porting 10 file `lib/store/**` (`authApi`, `commonApi`, `chartOfAccountsApi`, `dashboardApi`, `homeApi`, `journalEntryApi`, `periodsApi`, `reportsApi`, `settingsApi`, `toolsApi`) menjadi modul fungsi di `src/api/*.js`. Tipe (`PeriodItem`, `CreatePeriodRequest`, dll.) dipertahankan di `.ts`/JSDoc.
- Slice RTK lama **tidak dihapus** (masih dipakai halaman React).

**Selesai bila:** setiap fungsi baru menghasilkan respons identik dengan endpoint RTK pasangannya (uji perbandingan).

### Fase 4 — Komponen UI Statis (12 TSX)
`alert`, `avatar`, `badge`, `breadcrumb`, `button`, `card`, `input`, `label`, `separator`, `skeleton`, `table`, `textarea` → `components/ui/*.js` berupa fungsi yang mengembalikan elemen (varian lewat `cva`).

**Selesai bila:** halaman katalog sementara (`/__ui`) menampilkan semua varian; TSX pasangannya dihapus bila tidak ada pemakai React lagi, atau ditandai sementara.

### Fase 5 — Komponen UI Interaktif (15 TSX)
| Komponen | Pengganti |
|----------|-----------|
| `dialog`, `alert-dialog`, `sheet` | `<dialog>` native (+ fokus-trap bawaan, Esc, backdrop) |
| `popover`, `tooltip`, `dropdown-menu` | Popover API/ARIA + `@floating-ui/dom` |
| `select` | `<select>` native bergaya Tailwind; combobox khusus hanya bila halaman butuh pencarian |
| `tabs`, `toggle`, `toggle-group`, `radio-group`, `checkbox` | ARIA roles + navigasi keyboard |
| `collapsible` | `<details>` |
| `scroll-area`, `navigation-menu` | CSS native / ARIA |

**Selesai bila:** semua komponen lulus uji keyboard (Tab, Esc, panah) dan fokus kembali ke pemicu.

### Fase 6 — Helper Form, Tabel, Grafik
- `core/form.js`: baca `FormData`, validasi `zod` (`lib/validations/*.ts` tetap), tampilkan galat per kolom, status *submitting*.
- `core/table.js`: pembungkus `@tanstack/table-core` (sort, filter, paging, render baris).
- `core/chart.js`: pembungkus `chart.js` dengan `destroy()` pada cleanup.
- `core/xlsx.js`: ekspor Excel (tetap `xlsx`).

**Selesai bila:** satu tabel, satu form, dan satu grafik percobaan berjalan di halaman uji.

### Fase 7 — Home + Dashboard (6 TSX, ±1.158 baris)
`home/home-content.tsx`, `home/page.tsx`, `dashboard/dashboard-charts.tsx`, `dashboard-content.tsx`, `dashboard-tables.tsx`, `dashboard/page.tsx`.
Risiko: grafik Chart.js (pastikan `destroy()`), ringkasan angka.

### Fase 8 — Chart of Accounts + AI Assistant (4 TSX, ±1.441 baris)
`chart-of-accounts/{coa-dialogs, coa-table, page}.tsx`, `ai-assistant/page.tsx`.
`coa-types.ts` dan `lib/validations/chart-of-accounts.ts` tetap.
Risiko: dialog tambah/ubah/hapus akun; rentang nomor akun per kategori.

### Fase 9 — Periode + Jurnal Entry (6 TSX, ±2.044 baris)
`periods/{open-new-period-form, period-columns, page}.tsx`, `journal-entry/{journal-entry-content, journal-lines-table, page}.tsx`.
Risiko tertinggi pada form pembukaan periode (`setupMode`: `LoadExisting` / `CreateNew`, pemilihan akun kas/bank/laba ditahan) dan baris jurnal dinamis (debit = kredit).

### Fase 10 — Tools + Pengaturan (9 TSX, ±2.108 baris)
`tools/{mapping-status-table, preview-transaction-lines-table, page}.tsx`, `settings/{account, account-table, appearance, security, security-tables, page}.tsx`.
Catatan: `appearance` memakai `core/theme.js`; unggah avatar memakai `FormData`.

### Fase 11 — Laporan: Hub + Jurnal + Buku Besar (16 TSX, ±1.835 baris)
- `reports/page.tsx` (hub)
- `reports/journals/` — `general`, `adjusting`, `closing` + 5 komponen (`closing-group-table`, `delete-entry-dialog`, `general-journal-table`, `journal-empty-state`, `no-period-state`)
- `reports/general-ledgers/` — `permanent`, `temporary` + 5 komponen (`ledger-card`, `ledger-table`, `net-income-card`, `no-period-state`, `page-header`)

Risiko: pemisahan Buku Besar permanen vs sementara; hapus jurnal penyesuaian.

### Fase 12 — Laporan: Neraca Saldo + Worksheet (8 TSX, ±1.098 baris)
- `reports/trial-balances/` — `unadjusted`, `adjusted`, `post-closing` + `balance-alert`, `no-period-card`, `trial-table`
- `reports/worksheet/` — `page`, `worksheet-table`

Risiko: normalisasi data (`normalize.ts` tetap), keseimbangan debit/kredit.

### Fase 13 — Laporan Keuangan (11 TSX, ±1.251 baris)
`reports/financial-statements/` — `income-statement`, `retained-earnings`, `statement-of-cash-flow`, `statement-of-financial-position` + 4 tabel seksi + `ErrorAlert`, `LoadingState`, `NoPeriodCard`.
`_lib/formatters.ts` dan `_types/index.ts` tetap.

### Fase 14 — Shell Aplikasi (6 TSX)
`(authenticated)/layout.tsx`, `components/app-sidebar.tsx`, `app-topbar.tsx`, `app-footer.tsx`, `ui/sidebar.tsx`, `theme-provider.tsx`.
- Guard sesi: `getProfile` + muat info periode (perilaku `layout.tsx` saat ini), redirect ke `/auth` bila gagal.
- Sidebar: lebar 285px, mode ikon 3,5rem, versi mobile lewat `<dialog>`/sheet.
- Tema: `core/theme.js` menggantikan `next-themes`.

**Selesai bila:** semua halaman berjalan di dalam shell vanilla.

### Fase 15 — Landing + Router Murni + Lepas React (5 TSX)
`app/page.tsx` (landing), `main.tsx`, `lib/router.tsx`, `components/vanilla-mount.tsx`, `components/redux-provider.tsx`.
- `main.js`: pertahankan layar tunggu "Menghubungkan ke server..." (ping backend), lalu `startRouter()`.
- `lib/router.js`: Navigo + host halaman tunggal + 404 + splash; `Link` diganti `a[data-link]`.
- `index.html` menunjuk `/src/main.js`.
- Hapus seluruh slice RTK (`lib/store/**`, `store.ts`), `@vitejs/plugin-react` dari `vite.config.ts`.

**Selesai bila:** `find src -name '*.tsx'` menghasilkan **0**.

### Fase 16 — Pembersihan Dependensi & Hardening
- Uninstall: `react`, `react-dom`, `react-redux`, `@reduxjs/toolkit`, `react-hook-form`, `@hookform/resolvers`, `react-chartjs-2`, `next-themes`, `lucide-react`, `radix-ui`, `@tanstack/react-table`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`.
- `tsconfig.json`: hapus `"jsx"`; aktifkan `checkJs` bertahap.
- Bandingkan ukuran bundel sebelum/sesudah; target turun signifikan.
- Jalankan Playwright penuh; periksa `Dockerfile`, `vercel.json` (rewrite SPA), dan env `VITE_WEB_API_URL`, `VITE_GOOGLE_CLIENT_ID`.
- Perbarui dokumentasi struktur folder.

**Selesai bila:** gerbang akhir pada bagian 7 lulus.

---

## 7. Gerbang Akhir (Definisi Selesai)

| Pemeriksaan | Target |
|-------------|--------|
| File `.tsx` di `src/` | 0 |
| Impor `react*`, `redux*`, `radix-ui`, `lucide-react` | 0 |
| `npm run typecheck` | Lulus |
| `npm run build` | Lulus |
| `npm run test:e2e` | Seluruh rute lulus |
| Alur login (email + Google), logout, 401 → `/auth` | Identik dengan sebelum migrasi |
| Deploy Vercel | Berhasil, refresh pada rute dalam tetap termuat |

---

## 8. Risiko & Penanganan

| Risiko | Dampak | Penanganan |
|--------|--------|------------|
| Bentrok `page.tsx` vs `page.js` | React menang, halaman lama tetap tampil | Aturan 4.1: ganti dalam satu commit |
| Kebocoran listener/Chart.js | Memori naik, tampilan ganda | Cleanup wajib per halaman, uji pindah rute berulang |
| Regresi form periode & jurnal | Data akuntansi keliru | Uji e2e debit = kredit dan alur buka periode sebelum Fase 9 ditutup |
| Perilaku dialog/dropdown berbeda dari Radix | UX turun | Uji keyboard di Fase 5; katalog `/__ui` |
| Proxy dev tidak aktif | Dev lokal gagal ke API | Perbaikan `vite.config.ts` di Fase 1 |
| Ukuran pekerjaan halaman besar (Fase 11) | Review sulit | Pecah menjadi commit per sub-folder |
