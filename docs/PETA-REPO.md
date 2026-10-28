# Peta Repo — Aumo Finance

Denah folder, alur sistem, dan lokasi fitur. Identitas repo ada di [IDENTITAS-REPO.md](IDENTITAS-REPO.md).

## 1. Denah Tingkat Atas

```
aumo-finance/
├── backend/            API dan layanan server
│   ├── asp-net-core/   Backend utama (ASP.NET Core)
│   ├── axum/           Pustaka Rust (FFI)
│   ├── go/             Layanan auth Go (eksperimen)
│   ├── python/         Placeholder
│   └── AumoBackend.Test/  Placeholder proyek uji
├── frontend/           Aplikasi web (React SPA)
├── mobile/             Aplikasi Android native (Kotlin)
├── docs/               Dokumentasi
├── .github/workflows/  CI/CD (GitHub Actions)
├── Dockerfile          Build gabungan backend + frontend
├── nginx.conf          Reverse proxy dan static hosting
├── supervisord.conf    Pengelola proses di kontainer
├── build.ninja, rules.ninja   Orkestrasi build (Ninja)
└── README.md
```

## 2. Alur Sistem

```
Browser ──► Nginx :10000 ──┬─► /            → file statis SPA (frontend-dist)
                           ├─► /api         → ASP.NET Core 127.0.0.1:5000
                           ├─► /health      → ASP.NET Core
                           └─► /reference, /scalar, /openapi → dokumentasi API

Android ──► HTTPS ──► ASP.NET Core (JWT Bearer)

ASP.NET Core ──► PostgreSQL (Neon) · Redis · Hangfire · Neon Bucket
```

Satu kontainer menjalankan Nginx dan ASP.NET Core, dikelola Supervisord.

## 3. Backend — `backend/asp-net-core`

| Folder | Isi |
|---|---|
| `Controllers/` | Endpoint: Auth, Avatars, ChartOfAccounts, Dashboard, Health, Home, JournalEntry, Notifications, Periods, Settings, Tools |
| `Controllers/Reports/` | FinancialStatements, GeneralLedgers, Journals, Summary, TrialBalances, Worksheet |
| `Services/` | Logika bisnis per modul (Auth, ChartOfAccounts, Dashboard, Health, Home, Identity, JournalEntries, Notifications, Periods, Reports, Settings, Storage, Tools) |
| `Models/` | Entitas database dan model (akun, jurnal, buku besar, neraca saldo, periode, sesi, perangkat tepercaya) |
| `DTOs/`, `ViewModels/` | Objek transfer data |
| `Validators/` | Validasi (FluentValidation) |
| `Data/`, `Migrations/` | Konteks database dan migrasi EF Core |
| `Extensions/` | Registrasi layanan (database, identity, versi API) |
| `Helpers/`, `Middlewares/` | Utilitas dan filter (otorisasi dasbor Hangfire) |
| `Program.cs` | Titik masuk dan konfigurasi pipeline |

Prefix rute utama: `/auth`, `/chart-of-accounts`, `/journal-entry`, `/periods`, `/reports/*`, `/dashboard`, `/home`, `/settings`, `/tools`, `/notifications`, `/avatars`, `/health`.

## 4. Frontend — `frontend`

| Lokasi | Isi |
|---|---|
| `src/routes/` | Rute berbasis berkas (TanStack Router) |
| `src/routes/_authenticated/` | Halaman yang butuh login |
| `src/features/` | Modul per fitur: about, auth, chart-of-accounts, dashboard, home, journal-entry, periods, reports, settings, tools |
| `src/components/` | Komponen bersama (sidebar, topbar, footer, provider) dan `ui/` |
| `src/lib/` | API client, formatter, validasi, store Redux |
| `src/hooks/`, `src/styles/`, `src/types/` | Hook, gaya, tipe |
| `public/` | Aset statis |

Peta rute:

| Rute | Halaman |
|---|---|
| `/` , `/about` | Beranda publik, tentang |
| `/auth/login`, `/auth/register` | Masuk, daftar |
| `/home`, `/dashboard` | Menu utama, ringkasan |
| `/chart-of-accounts` | Bagan akun |
| `/journal-entry` | Input jurnal |
| `/periods` | Periode akuntansi |
| `/reports` | Menu laporan |
| `/reports/journals/{general,adjusting,closing}` | Jurnal |
| `/reports/general-ledgers/{permanent,temporary}` | Buku besar |
| `/reports/trial-balances/{unadjusted,adjusted,post-closing}` | Neraca saldo |
| `/reports/worksheet` | Kertas kerja |
| `/reports/financial-statements/{statement-of-financial-position,income-statement,retained-earnings,statement-of-cash-flow}` | Laporan keuangan |
| `/settings`, `/tools`, `/ai-assistant` | Pengaturan, alat, asisten AI |

Skrip utama (`pnpm`): `dev`, `build`, `typecheck`, `lint`, `format`, `test:e2e`.

## 5. Mobile — `mobile`

Jalur: `mobile/app/src/main/java/com/aumofinance/app/`

| Paket | Fungsi |
|---|---|
| `auth/` | Login dan biometrik |
| `coa/` | Bagan akun |
| `core/` | Application, formatter mata uang, SyncManager (placeholder) |
| `crashlog/` | Penangkap dan penampil log crash |
| `dashboard/` | Ringkasan |
| `data/` | Pemantau koneksi backend |
| `home/` | Menu utama |
| `journal/` | Input jurnal |
| `logout/` | Keluar |
| `network/` | ApiClient (Ktor), SessionManager, SessionStore |
| `periods/` | Periode akuntansi |
| `reports/` | Laporan: financials, journal, ledger, trialbalance, worksheet, menu |
| `settings/` | Pengaturan |
| `splash/` | Splash dan pemulihan sesi |
| `ui/` | Komponen, ikon, tema Compose |
| `update/` | Pembaruan APK via GitHub Releases |

Detail stack: lihat [../README.md](../README.md) dan [spacing-scale.md](spacing-scale.md), [typography-scale.md](typography-scale.md).

## 6. CI/CD — `.github/workflows`

Semua workflow dipicu manual (`workflow_dispatch`).

| Berkas | Fungsi |
|---|---|
| `android-build.yml` | Build, tanda tangan, dan rilis APK Kotlin |
| `android_built_2.yml` | Build Android (Capacitor) |
| `frontend-android-ci.yml` | CI frontend untuk Android |
| `code-quality.yml` | Kualitas kode, format, dan uji (C#, Rust, TypeScript) |
| `ninja-build.yml` | Build monorepo dengan Ninja |

## 7. Dokumentasi — `docs`

| Berkas | Topik |
|---|---|
| `Standarisasi-penggunaan-case.md` | Standar penulisan nama (casing) proyek .NET |
| `Struktur_folder_kedepan.md` | Rencana struktur folder ekosistem TypeScript |
| `struktur-folder-backend2.md` | Struktur folder backend |
| `fase-pembuatan-web.md` | Fase pembuatan web dengan pendekatan API-First |
| `pembuatan-backend.md` | Alur membuat endpoint baru (NestJS, Drizzle, Zod) |
| `koneksi-dg-drizzle.md` | Cara kerja Drizzle ORM dan Drizzle Kit |
| `penggunaan-store.md` | Penggunaan AuthStore (state autentikasi) |
| `restrat-typescript.md` | Perintah menjalankan TypeScript |
| `command-penting.md` | Perintah penting (pembaruan dependensi dll.) |
| `trik-debugging.md` | Trik debugging bertahap |
| `spacing-scale.md` | Skala spasi dan densitas layar (mobile) |
| `typography-scale.md` | Skala tipografi (mobile) |
| `ukuran-font-web.md` | Ukuran font web |
| `IDENTITAS-REPO.md` | Identitas repo |
| `PETA-REPO.md` | Dokumen ini |

## 8. Catatan Status

- Backend aktif adalah ASP.NET Core; `axum`, `go`, `python` belum menjadi bagian jalur produksi (Dockerfile hanya mempublikasikan `AumoBackend.csproj`).
- `mobile-capacitor` disebut di README dan workflow, tetapi foldernya belum ada di `main`.
- `backend/AumoBackend.Test` dan `frontend/src/tests` masih berisi berkas placeholder.
- Sebagian dokumen di `docs/` (NestJS, Drizzle) merupakan catatan rencana ekosistem TypeScript, bukan stack yang berjalan saat ini.
