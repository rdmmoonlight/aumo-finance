# Panduan Membuat Frontend Vue.js (UI Identik 100% dengan `/frontend`)

Tujuan: membuat versi **Vue 3** dari `frontend/` (React 19) dengan tampilan **identik 100%**. Fungsi, route, dan kontrak API tidak berubah. Folder `frontend/` **tidak disentuh**; hasil kerja berada di folder baru `frontend-vue/`.

Urutan kerja: **dari yang termuda (komponen terkecil) ke yang terbesar (halaman penuh)**. Satu fase harus lulus checklist sebelum fase berikutnya dimulai.

---

## 1. Prinsip Agar UI Identik

1. **Tailwind v4 dan token CSS yang sama.** Salin `src/styles/theme.css` dan `src/styles/index.css` apa adanya. Jangan menulis ulang warna, radius, atau ukuran teks.
2. **Salin string `className` apa adanya.** Di Vue namanya `class`. Markup (urutan elemen, atribut `data-slot`, `data-state`) mengikuti file `.tsx` sumber.
3. **shadcn-vue gaya `new-york`, baseColor `zinc`.** Sama dengan `components.json` di `frontend/`. shadcn-vue adalah port resmi komunitas dari shadcn/ui (basisnya `reka-ui`, pengganti Radix untuk Vue), jadi struktur DOM dan class mendekati aslinya. Tetap **bandingkan class satu per satu** karena versi bisa berbeda.
4. **Ikon Lucide yang sama**, ukuran yang sama (`size-4`, `h-4 w-4`).
5. **Font Inter**, tema **dark matte** sebagai default, light tersedia.
6. **Acuan kebenaran = aplikasi React yang berjalan**, bukan file lama di `src/components/top-bar`, `nav-menu`, `footer`. File vanilla lama itu memakai warna terang dan tidak sama dengan tampilan asli.

### Temuan dari kode `frontend/` yang wajib ditiru

| No | Temuan | Sumber |
|---|---|---|
| 1 | Wrapper layout memakai `--sidebar-width: 285px` dan `--sidebar-width-icon: 3.5rem`, sedangkan kontainer sidebar memakai `255px` dan `4rem`. Dua pasang nilai ini harus sama persis. | `components/layouts/authenticated-layout.tsx`, `components/app-sidebar.tsx` |
| 2 | Pilihan tema disimpan di `localStorage` kunci `theme`; class `dark`/`light` dipasang pada `<html>`; default mengikuti sistem. | `components/theme-provider.tsx` (next-themes) |
| 3 | Breakpoint mobile = 768px. Sidebar desktop berkelas `hidden md:block`. | `hooks/use-mobile.ts` |
| 4 | Status sidebar disimpan di cookie `sidebar_state` (7 hari); pintasan `Ctrl/Cmd + B`. | `components/ui/sidebar.tsx` |
| 5 | Semua request API memakai `credentials: "include"` ke `/api/v1`; status 401 di luar halaman publik (`/` dan `/auth*`) mengalihkan pengguna ke login. | `lib/apiClient.ts` |
| 6 | Proxy dev: `/api` diteruskan ke `PUBLIC_WEB_API_URL` (default `http://localhost:5000`). | `vite.config.ts` |

---

## 2. Padanan Teknologi (React → Vue)

| Fungsi | `frontend/` (React) | `frontend-vue/` (Vue) |
|---|---|---|
| Framework | React 19 | Vue 3 (`<script setup lang="ts">`) |
| Build | Vite + plugin React | Vite + `@vitejs/plugin-vue` |
| Router | TanStack Router (berbasis file) | Vue Router 4 (daftar route manual, urutan sama dengan tabel §6) |
| Data server | Redux Toolkit + RTK Query | TanStack Vue Query (`@tanstack/vue-query`) |
| Klien API (kode otomatis) | `@rtk-query/codegen-openapi` | `@hey-api/openapi-ts` (plugin `@tanstack/vue-query`) dari skema yang sama |
| Komponen UI | shadcn/ui + `radix-ui` | shadcn-vue + `reka-ui` |
| Gaya | Tailwind v4 + `tw-animate-css` | Tailwind v4 (`@tailwindcss/vite`) + `tw-animate-css` |
| Util class | `clsx` + `tailwind-merge` + `cva` | Sama (`clsx`, `tailwind-merge`, `class-variance-authority`) |
| Ikon | `lucide-react` | `lucide-vue-next` |
| Tema | `next-themes` | `useColorMode` dari `@vueuse/core` (kunci `theme`) |
| Form + validasi | `react-hook-form` + `zod` | `vee-validate` + `zod` (adaptor `@vee-validate/zod`); periksa dukungan zod v4 pada versi terpasang |
| Toast | `sonner` | `vue-sonner` |
| Grafik | `recharts` 3.8 | SVG buatan sendiri dengan `d3-scale` + `d3-shape` (lihat Fase 8) |
| Excel | `xlsx` | `xlsx` (sama) |
| Login Google | `@react-oauth/google` | `vue3-google-login` |
| Uji visual | Playwright | Playwright (sama) |

### Kamus Konversi Kode

| React | Vue 3 |
|---|---|
| `useState(x)` | `const a = ref(x)` |
| `useMemo(() => ..., [d])` | `computed(() => ...)` |
| `useEffect(() => ..., [d])` | `watch(d, () => ...)` atau `watchEffect` |
| `useEffect(() => ..., [])` | `onMounted(() => ...)` |
| `props` + `children` | `defineProps<T>()` + `<slot />` |
| `className={cn("a", cond && "b")}` | `:class="cn('a', cond && 'b')"` |
| `{cond && <X/>}` | `<X v-if="cond" />` |
| `{list.map(i => <X key={i.id}/>)}` | `<X v-for="i in list" :key="i.id" />` |
| `onClick={fn}` | `@click="fn"` |
| `value` + `onChange` | `v-model` |
| `asChild` (Radix) | `as-child` (reka-ui) |
| `useRouter`, `useNavigate` | `useRouter()`, `router.push()` dari `vue-router` |

---

## 3. Struktur Folder Target

```
frontend-vue/
├── index.html
├── components.json              # shadcn-vue: style new-york, baseColor zinc
├── vite.config.ts
├── tsconfig.json
├── package.json
├── public/                      # favicon.ico, favicon.png (salin dari frontend/public)
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/index.ts
│   ├── styles/                  # theme.css, index.css (salinan frontend/src/styles)
│   ├── lib/                     # utils.ts, api.ts, query-client.ts
│   ├── hooks/                   # use-mobile.ts
│   ├── components/
│   │   ├── ui/                  # shadcn-vue
│   │   ├── layouts/             # AuthenticatedLayout.vue, RootLayout.vue
│   │   ├── AppFooter.vue
│   │   ├── AppTopbar.vue
│   │   └── AppSidebar.vue
│   ├── features/                # satu folder per fitur, sama dengan frontend/src/features
│   └── tests/                   # Playwright (uji paritas visual)
```

---

## Fase 0 — Persiapan

1. Buat proyek:
   ```bash
   pnpm create vue@latest frontend-vue
   # pilih: TypeScript, Vue Router, ESLint, Prettier. Pinia: tidak (state server memakai Vue Query).
   cd frontend-vue
   pnpm install
   ```
2. Pasang paket:
   ```bash
   pnpm add @tanstack/vue-query @vueuse/core vee-validate @vee-validate/zod zod \
     lucide-vue-next vue-sonner reka-ui class-variance-authority clsx tailwind-merge \
     xlsx vue3-google-login d3-scale d3-shape
   pnpm add -D tailwindcss @tailwindcss/vite tw-animate-css @playwright/test \
     @hey-api/openapi-ts @types/d3-scale @types/d3-shape
   ```
3. Salin `frontend/public/favicon.ico` dan `favicon.png` ke `frontend-vue/public/`.
4. Salin `frontend/index.html`, lalu sesuaikan `<script type="module" src="/src/main.ts">` dan `<div id="app">`.
5. Atur alias `#/` dan `@/` ke `src/` di `vite.config.ts` dan `tsconfig` (kode asli memakai keduanya).
6. `vite.config.ts`:
   ```ts
   import vue from "@vitejs/plugin-vue";
   import tailwindcss from "@tailwindcss/vite";
   import { defineConfig, loadEnv } from "vite";
   import { fileURLToPath, URL } from "node:url";

   export default defineConfig(({ mode }) => {
     const env = loadEnv(mode, process.cwd(), "");
     const target = (env.PUBLIC_WEB_API_URL || "http://localhost:5000").replace(/\/+$/, "");
     return {
       plugins: [vue(), tailwindcss()],
       resolve: {
         alias: {
           "#": fileURLToPath(new URL("./src", import.meta.url)),
           "@": fileURLToPath(new URL("./src", import.meta.url)),
         },
       },
       build: { outDir: "dist" },
       server: { port: 5174, proxy: { "/api": { target, changeOrigin: true, secure: false } } },
     };
   });
   ```
   Port 5174 dipilih agar bisa berjalan berdampingan dengan aplikasi React untuk perbandingan.

**Checklist:** `pnpm dev` menampilkan halaman Vue kosong tanpa error.

---

## Fase 1 — Fondasi Desain

1. Salin `frontend/src/styles/theme.css` dan `index.css` ke `src/styles/`. Impor `index.css` di `main.ts`.
2. Di `index.css` pastikan ada `@import "tailwindcss";` dan `@import "tw-animate-css";` seperti aslinya.
3. Salin `frontend/src/lib/utils.ts` (fungsi `cn`) ke `src/lib/utils.ts`; isinya sama karena memakai `clsx` + `tailwind-merge`.
4. Tema: buat `src/lib/theme.ts` memakai `useColorMode({ storageKey: "theme", attribute: "class", modes: { light: "light", dark: "dark" } })` dengan nilai awal `auto`. Panggil sebelum render pertama agar tidak berkedip.
5. Salin `hooks/use-mobile.ts` (breakpoint 768px) menjadi composable `useIsMobile` dengan `useMediaQuery("(max-width: 767px)")`.
6. Inisialisasi shadcn-vue:
   ```bash
   pnpm dlx shadcn-vue@latest init
   # style: new-york, base color: zinc, CSS variables: ya, CSS file: src/styles/index.css
   ```
   Setelah itu **pulihkan** `theme.css`/`index.css` dari salinan asli, karena `init` dapat menimpa variabel warna.

**Checklist:** latar halaman `hsl(0 0% 5.5%)` pada mode gelap, font Inter aktif, pergantian tema berfungsi dan bertahan setelah reload.

---

## Fase 2 — Komponen Dasar (`src/components/ui`)

Sumber: `frontend/src/components/ui/*.tsx` (31 file). Tambahkan lewat CLI, lalu **diff class** dengan versi React.

```bash
pnpm dlx shadcn-vue@latest add separator skeleton label badge button input textarea \
  checkbox radio-group avatar card alert table breadcrumb tooltip popover \
  dropdown-menu dialog alert-dialog sheet tabs collapsible toggle toggle-group \
  select scroll-area navigation-menu sonner sidebar
```

Kerjakan dengan urutan berikut (termuda dulu). Untuk tiap komponen: buka file `.tsx` sumber, bandingkan string class dengan file `.vue` hasil CLI, lalu samakan.

| Urutan | Komponen | Catatan |
|---|---|---|
| 1 | separator, skeleton, label | Tanpa perilaku |
| 2 | badge | Varian: default, secondary, destructive, outline, ghost, link |
| 3 | button | Varian × ukuran: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg |
| 4 | input, textarea, checkbox, radio-group | State fokus, invalid, disabled |
| 5 | avatar | Gambar + fallback inisial |
| 6 | card, alert, table | Struktur saja |
| 7 | breadcrumb | Pemisah ikon chevron |
| 8 | tooltip | Tampil saat hover/fokus |
| 9 | popover, dropdown-menu | Posisi `side` dan `align` |
| 10 | dialog, alert-dialog, sheet | Overlay, kunci scroll, Esc |
| 11 | tabs, collapsible, toggle, toggle-group | Atribut `data-state` |
| 12 | select, scroll-area, navigation-menu, sonner | Paling kompleks |
| 13 | sidebar | Dikerjakan bersama Fase 3.3 |

Buat halaman uji `src/features/_gallery/GalleryPage.vue` yang memuat semua komponen dan varian. Halaman ini dipakai untuk perbandingan visual dan dihapus pada Fase 10.

**Checklist per komponen:** sama persis dengan versi React pada mode gelap dan terang (state normal, hover, fokus, disabled, open/closed).

---

## Fase 3 — Komponen Shell

Kerjakan berurutan.

### 3.1 Footer
Sumber: `components/app-footer.tsx` → `AppFooter.vue`. Tahun memakai `new Date().getFullYear()`.

### 3.2 Top Bar
Sumber: `components/app-topbar.tsx` → `AppTopbar.vue`.
- Bar utama: input pencarian (`pl-9 bg-muted/40`), tombol notifikasi, popover `w-80 p-0 mr-4`.
- Bar sekunder: breadcrumb dari `route.path` (`useRoute()`), badge periode, indikator status DB (`online`, `connecting`, `offline`; animasi `animate-pulse` dan `animate-ping`).
- Data periode dan status DB berasal dari query yang sama dengan versi React (hubungkan di Fase 9; sebelumnya pakai data contoh).

### 3.3 Sidebar
Sumber: `components/app-sidebar.tsx` dan `components/ui/sidebar.tsx` → `AppSidebar.vue`.
- Struktur: wrapper `group peer hidden md:block` + `sidebar-gap` + `sidebar-container` + `sidebar-inner`; atribut `data-state` dan `data-collapsible="icon"` pada wrapper.
- Perilaku: collapse, rail, `Ctrl/Cmd + B`, cookie `sidebar_state`, tooltip saat collapsed, dropdown pengguna (Settings, Sign Out).
- Menu: Home, Dashboard, Periods, Chart of Accounts, Journal Entry, Reports, Tools, Settings. Menu aktif bila path sama persis atau diawali `url + "/"` (kecuali `/home`).
- Terapkan temuan nomor 1 (285px/255px).

### 3.4 Layout Terautentikasi
Sumber: `components/layouts/authenticated-layout.tsx` → `AuthenticatedLayout.vue`.
- Susunan: `SidebarProvider` → `AppSidebar` + `SidebarInset` (`AppTopbar` + `main.relative.flex-1.p-6` berisi `<RouterView />` + `AppFooter`).
- Teks status yang sama: "Memverifikasi sesi...", "Memuat periode...".
- Guard sesi: `router.beforeEach` untuk route yang berada di bawah layout ini; panggil query profil pengguna, jika 401 alihkan ke `/auth/login`.

**Checklist:** ukur lebar sidebar di DevTools: kontainer 255px/4rem, gap 285px/3.5rem. Tinggi top bar, jarak, dan bayangan sama dengan aplikasi React.

---

## Fase 4 — Router, Klien API, dan State Server

Dikerjakan sebelum halaman agar halaman bisa langsung memakai data nyata.

1. **Router** (`src/router/index.ts`): daftar route sesuai §6. Route `_authenticated` menjadi route induk dengan `AuthenticatedLayout` dan semua anaknya.
2. **Klien API** (`src/lib/api.ts`): port dari `lib/apiClient.ts`.
   - Dasar URL `/api/v1`, `credentials: "include"`.
   - Jika body `FormData`, hapus header `Content-Type`.
   - Jalur harus diawali `/` (aturan yang sama dengan versi asli).
   - Status 401 di luar `/` dan `/auth*` → alihkan ke login satu kali (flag `isRedirecting`).
3. **Query client** (`src/lib/query-client.ts`) dan pasang `VueQueryPlugin` di `main.ts`.
4. **Kode API otomatis:** buat `openapi-ts.config.ts` dengan skema `https://aumoweb.onrender.com/openapi/v1.json` (sama dengan `openapi-config.ts`), plugin `@tanstack/vue-query`. Tambahkan script `api:generate`.
5. **API per fitur:** port `features/*/api/*.ts` menjadi composable (`useLoginMutation`, `usePeriodsQuery`, dan seterusnya) dengan nama yang konsisten.

**Checklist:** login dan pengambilan data periode berhasil terhadap backend lokal; 401 mengalihkan ke login tanpa perulangan.

---

## Fase 5 — Halaman Publik

| Halaman | Sumber | Ukuran |
|---|---|---|
| Landing `/` | `features/landing` | ±184 baris |
| Dialog Sign In / Register | `features/landing/components/auth-dialog.tsx` | — |
| `/auth/login`, `/auth/register`, `/auth` | `features/auth` | ±492 baris |

Port juga `use-login-throttle.ts` (pembatas percobaan login) menjadi composable, dan skema validasi `lib/validations/auth.ts` ke vee-validate. Tombol Google memakai `vue3-google-login`.

---

## Fase 6 — Halaman Ringan dan Menengah (≤ 700 baris)

Kerjakan urut dari yang terkecil.

| Urutan | Halaman | Sumber | Baris |
|---|---|---|---|
| 1 | About | `features/about` | kecil |
| 2 | Home | `features/home` | 247 |
| 3 | Reports (indeks) | `features/reports/reports-page` | 270 |
| 4 | General Ledgers (indeks, permanent, temporary) | `features/reports/general-ledgers` | 351 |
| 5 | Worksheet | `features/reports/worksheet` | 393 |
| 6 | Trial Balances (indeks, unadjusted, adjusted, post-closing) | `features/reports/trial-balances` | 505 |
| 7 | Tools | `features/tools` | 652 |

Pola berulang (kartu "tanpa periode", tabel laporan, format rupiah) dijadikan komponen/utilitas bersama, bukan disalin per halaman.

---

## Fase 7 — Halaman Berat (700–1.100 baris)

| Urutan | Halaman | Sumber | Baris |
|---|---|---|---|
| 1 | Journal Entry | `features/journal-entry` | 751 |
| 2 | Journals (indeks, general, adjusting, closing) | `features/reports/journals` | 856 |
| 3 | Chart of Accounts | `features/chart-of-accounts` | 859 |
| 4 | Periods | `features/periods` | 913 |
| 5 | Financial Statements (indeks, income statement, retained earnings, cash flow, financial position) | `features/reports/financial-statements` | 1.101 |

Validasi form: skema Zod dari `lib/validations/*.ts` dipakai ulang tanpa perubahan lewat `toTypedSchema`. Aturan seperti "debit harus sama dengan kredit" tetap di skema, bukan di komponen.

---

## Fase 8 — Dashboard (Grafik) dan Settings

### 8.1 Dashboard
Sumber: `features/dashboard` dengan tiga grafik: `revenue-line`, `expense-donut`, `expense-revenue-bar`.

Recharts tidak punya port Vue. Untuk hasil identik, gambar ulang sebagai SVG dengan `d3-scale` + `d3-shape` (garis, busur donat, batang), lalu samakan: margin, jumlah tick, warna, tooltip, legenda, dan animasi masuk. Ambil nilai persis dari kode `revenue-line.tsx`, `expense-donut.tsx`, `expense-revenue-bar.tsx` dan `components/ui/chart.tsx`.

### 8.2 Settings
Sumber: `features/settings` (±1.366 baris), terbesar. Kerjakan per tab (Account, Security, Appearance), satu tab satu commit.

---

## Fase 9 — Integrasi dan Paritas Visual

1. Hubungkan semua data contoh ke composable API (Fase 4).
2. Jalankan dua aplikasi berdampingan: React di `:5173`, Vue di `:5174`, backend di `:5000`.
3. Uji paritas visual dengan Playwright. Contoh `src/tests/parity.spec.ts`:
   ```ts
   import { test, expect } from "@playwright/test";

   const pages = ["/", "/auth/login", "/home", "/dashboard", "/periods", "/chart-of-accounts",
     "/journal-entry", "/reports", "/tools", "/settings", "/about"];
   const sizes = [{ width: 1440, height: 900 }, { width: 1024, height: 768 },
     { width: 768, height: 1024 }, { width: 390, height: 844 }];

   for (const size of sizes) for (const path of pages) {
     test(`paritas ${path} ${size.width}`, async ({ page }) => {
       await page.setViewportSize(size);
       await page.goto(`http://localhost:5174${path}`);
       await page.waitForLoadState("networkidle");
       await expect(page).toHaveScreenshot(`${path.replace(/\//g, "_")}-${size.width}.png`,
         { maxDiffPixels: 0, animations: "disabled" });
     });
   }
   ```
   Buat gambar acuan dari aplikasi React (ubah `baseURL` ke `:5173`, jalankan sekali dengan `--update-snapshots`), lalu jalankan terhadap Vue.
4. Ulangi untuk mode gelap dan terang (`page.emulateMedia({ colorScheme })`) dan untuk state: sidebar collapsed, dialog terbuka, dropdown terbuka.
5. Perbaiki setiap selisih piksel sampai nol.

**Checklist akhir:** semua uji paritas lulus; tidak ada error di konsol; `pnpm build` dan `vue-tsc --noEmit` hijau.

---

## Fase 10 — Build, Deploy, dan Rapikan

1. Tambahkan script di `package.json`: `dev`, `build` (`vue-tsc --noEmit && vite build`), `preview`, `lint`, `format`, `test:e2e`, `api:generate`.
2. Sesuaikan `Dockerfile`, `nginx.conf`, dan `build.ninja` agar mengarah ke `frontend-vue/dist` (sambil tetap menyimpan jalur lama sampai migrasi selesai). Pastikan fallback SPA (`try_files $uri /index.html`) dan proxy `/api` tetap sama.
3. Tambahkan job CI untuk `frontend-vue` (install, lint, typecheck, build).
4. Hapus `_gallery` dan data contoh.
5. Setelah semua uji lulus dan tim menyetujui, putuskan nasib `frontend/` (arsipkan atau hapus) pada commit terpisah.

---

## 6. Daftar Route (26 halaman)

| Path | Fitur |
|---|---|
| `/` | Landing |
| `/auth`, `/auth/login`, `/auth/register` | Auth |
| `/home`, `/dashboard`, `/about` | Halaman utama |
| `/periods`, `/chart-of-accounts`, `/journal-entry`, `/tools`, `/settings` | Fitur inti |
| `/reports` | Indeks laporan |
| `/reports/journals`, `/reports/journals/general`, `/adjusting`, `/closing` | Jurnal |
| `/reports/general-ledgers`, `/permanent`, `/temporary` | Buku besar |
| `/reports/trial-balances`, `/unadjusted`, `/adjusted`, `/post-closing` | Neraca saldo |
| `/reports/worksheet` | Neraca lajur |
| `/reports/financial-statements`, `/income-statement`, `/retained-earnings`, `/statement-of-cash-flow`, `/statement-of-financial-position` | Laporan keuangan |

Semua route selain `/` dan `/auth*` berada di bawah layout terautentikasi.

---

## Template Tugas per Komponen/Halaman

```
[ ] Buka file .tsx sumber; catat semua className, data-slot, data-state
[ ] Buat file .vue; salin class ke atribut class
[ ] Ubah state/efek memakai kamus konversi (§2)
[ ] Samakan ikon (nama Lucide dan ukuran)
[ ] Uji mode gelap + terang
[ ] Uji 4 lebar layar (1440, 1024, 768, 390)
[ ] Bandingkan berdampingan dengan aplikasi React (selisih piksel = 0)
[ ] Commit: "feat(vue/fase-X): <nama>"
```

## Aturan Kerja

1. Satu komponen atau satu halaman = satu commit. Format: `feat(vue/fase-3): sidebar`, `fix(vue/fase-2): jarak badge`.
2. `frontend/` tidak diubah selama pekerjaan ini.
3. Setiap selisih visual dianggap bug, sekecil apa pun.
4. Jangan menambah dependensi UI di luar tabel §2 tanpa alasan tertulis.

## Urutan Ringkas

`Fase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10`
