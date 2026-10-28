# Aumo Finance

Sistem informasi keuangan dan akuntansi terintegrasi, berorientasi presisi.

## Fitur

- Bagan Akun (Chart of Accounts)
- Jurnal Umum, Jurnal Penyesuaian, Jurnal Penutup
- Buku Besar (akun riil dan nominal)
- Neraca Saldo (belum disesuaikan, disesuaikan, setelah penutupan)
- Kertas Kerja
- Laporan Keuangan (posisi keuangan, laba rugi, perubahan modal, arus kas)
- Manajemen Periode Akuntansi

## Struktur

| Folder | Isi | Teknologi |
|---|---|---|
| `backend/asp-net-core` | REST API utama | ASP.NET Core (.NET 10), EF Core, PostgreSQL |
| `frontend` | Aplikasi web | React 19, TypeScript, Rsbuild, TanStack Router, Tailwind |
| `mobile` | Aplikasi Android native | Kotlin, Jetpack Compose |
| `backend/axum`, `backend/go` | Eksperimen (belum dipakai produksi) | Rust, Go |
| `docs` | Dokumentasi | Markdown |

## Autentikasi

- Web: cookie
- Mobile: JWT Bearer

## Menjalankan

Backend:

```bash
dotnet run --project backend/asp-net-core
```

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Mobile (Android):

```bash
cd mobile
./gradlew assembleDebug
```

## Deploy

- Web dan API: satu kontainer (Nginx + ASP.NET Core) lewat `Dockerfile`, di Render.com.
- Android: APK dibangun dan dirilis lewat GitHub Actions (`.github/workflows/android-build.yml`) ke GitHub Releases.

## Dokumentasi

- [Identitas repo](docs/IDENTITAS-REPO.md)
- [Peta repo](docs/PETA-REPO.md)
- [Detail aplikasi Android](mobile/README.md)
