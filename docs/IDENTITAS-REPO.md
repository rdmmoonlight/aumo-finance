# Identitas Repo — Aumo Finance

| Item | Keterangan |
|---|---|
| Nama | Aumo Finance |
| Deskripsi | Sistem informasi keuangan dan akuntansi terintegrasi, berorientasi presisi |
| Pemilik | `rdmmoonlight` |
| Repo | `rdmmoonlight/aumo-finance` |
| Cabang utama | `main` |
| Proyek dimulai | 25 Mei 2026 (menurut README) |
| Commit pertama | 18 Juli 2026 (`274ad7cf`) |
| Commit fungsional terakhir | 28 Oktober 2026 (`e685ce1c`) |
| Pembaruan terakhir | 28 Oktober 2026 (dokumentasi, `f0989a5a`) |
| Jumlah commit | 3.664 (per 28 Oktober 2026) |
| Tipe repo | Monorepo (backend, frontend, mobile dalam satu repo) |
| Bahasa dokumentasi | Indonesia |

## Fungsi Aplikasi

Mencatat transaksi dan menghasilkan laporan sesuai siklus akuntansi:

1. Bagan Akun (Chart of Accounts)
2. Jurnal Umum (input jurnal)
3. Buku Besar (akun riil / permanen dan akun nominal / sementara)
4. Neraca Saldo (belum disesuaikan, disesuaikan, setelah penutupan)
5. Kertas Kerja (worksheet)
6. Laporan Keuangan (posisi keuangan, laba rugi, perubahan modal, arus kas)
7. Jurnal Penyesuaian dan Jurnal Penutup
8. Manajemen Periode Akuntansi (buka/tutup periode)

## Komponen

| Komponen | Folder | Teknologi | Peran |
|---|---|---|---|
| Backend | `backend/asp-net-core` | ASP.NET Core (.NET 10 preview), EF Core, PostgreSQL | REST API utama, logika akuntansi |
| Frontend | `frontend` | React 19, TypeScript, Rsbuild, TanStack Router, Redux Toolkit, Tailwind 4 | Aplikasi web (SPA) |
| Mobile | `mobile` | Kotlin, Jetpack Compose (Material3), Ktor Client | Aplikasi Android native |
| Core FFI | `backend/axum` | Rust (cdylib) | Pustaka FFI, masih tahap contoh |
| Auth service | `backend/go` | Go | Layanan autentikasi eksperimen |
| Dokumentasi | `docs` | Markdown | Catatan teknis dan panduan |

## Autentikasi

- Web: cookie
- Mobile: JWT Bearer
- Tambahan: Google OAuth, Identity (ASP.NET Core)

## Layanan Pendukung

- Database: PostgreSQL (Neon), konteks `NeondbContext`
- Penyimpanan avatar: Neon Bucket (kompatibel S3)
- Cache: Redis
- Job latar belakang: Hangfire (PostgreSQL)
- Log: Serilog
- Dokumentasi API: OpenAPI + Scalar (`/reference`, `/scalar`, `/openapi`)

## Deploy

| Target | Platform | Keterangan |
|---|---|---|
| Web + API (satu kontainer) | Render.com | `Dockerfile` di root; Nginx + Supervisord |
| Frontend (awal) | Vercel | Deploy pertama 9 September 2026 |
| Android | GitHub Releases | APK ditandatangani lewat GitHub Actions |

Alamat API produksi untuk mobile: `https://aumonext-api.onrender.com`.

## Identitas Aplikasi Android

- `applicationId`: `com.bnrc.aumofinance` (tetap sama dengan aplikasi MAUI lama agar dianggap pembaruan)
- `minSdk` 28, `targetSdk`/`compileSdk` 34
- Versi: CalVer `yy.M.N`

## Riwayat Penting

| Tanggal | Peristiwa |
|---|---|
| 25 Mei 2026 | Proyek dimulai (menurut README) |
| 18 Juli 2026 | Commit pertama di riwayat git repo ini |
| 9 September 2026 | Deploy frontend pertama (Vercel) |
| 10–11 Oktober 2026 | Deploy frontend dan backend pertama dengan Dockerfile di Render.com |
| 12 Oktober 2026 | Folder `mobile-capacitor` dibuat (belum ada di cabang `main` saat dokumen ini ditulis) |
| 28 Oktober 2026 | Perbaikan service TrialBalances dan Worksheet; dokumen identitas dan peta repo ditambahkan |

## Dokumen Terkait

- [PETA-REPO.md](PETA-REPO.md) — denah folder dan alur sistem
- [../README.md](../README.md) — ringkasan dan stack mobile
