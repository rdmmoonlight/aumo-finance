# Aumo Finance — Mobile (Android, Kotlin native)

Aplikasi Android native (bukan React Native/Flutter/MAUI) untuk Aumo Finance.
Folder ini murni **konsumen REST API** — semua logika bisnis, skema database,
dan endpoint ada di [`/backend`](../backend) pada repo yang sama. Jangan buat
skema/endpoint baru di sini; kalau app butuh perubahan API, perubahannya masuk
ke `/backend`.

Autentikasi pakai **JWT Bearer** (bukan cookie session seperti web): login
mengembalikan token, dikirim di setiap request berikutnya lewat header
`Authorization: Bearer <token>`.

## Tech stack

| Bagian | Pilihan |
|---|---|
| Bahasa | Kotlin, JDK 17 |
| Build | Gradle Kotlin DSL (`build.gradle.kts`), AGP 8.5.0, Gradle Wrapper (`./gradlew`, tidak butuh Android Studio) |
| SDK | `minSdk` 28 / Android 9 — **dikunci**, jangan dinaikkan tanpa instruksi eksplisit. `compileSdk`/`targetSdk` 34 |
| UI | Campuran View/XML lama (Material Components, ConstraintLayout) + Jetpack Compose (Material3) untuk layar baru — migrasi masih bertahap |
| Networking | Ktor Client (engine OkHttp) + Gson, base URL `https://aumonext-api.onrender.com` |
| Sesi | `EncryptedSharedPreferences` (AES256-GCM via Android Keystore) untuk "ingat saya", `BiometricPrompt` untuk login sidik jari/wajah |
| Async | Kotlinx Coroutines |
| Lint | ktlint (`org.jlleitschuh.gradle.ktlint`) |
| CI/CD | GitHub Actions (`.github/workflows/android-build.yml`) |

`applicationId` = `com.bnrc.aumofinance` — harus tetap sama dengan app MAUI
lama supaya Play Store menganggap rilis berikutnya sebagai update, bukan
aplikasi baru (lihat komentar di `app/build.gradle.kts`).

## Build

```
./gradlew assembleDebug     # APK debug, tidak perlu signing
./gradlew assembleRelease   # APK release, unsigned
```

Build+sign+publish APK otomatis lewat GitHub Actions (`android-build.yml`)
trigger **manual** (`workflow_dispatch` dari tab Actions), bukan tiap push.
Pipeline-nya: bump versi CalVer → build release APK (unsigned) → decode
keystore dari secret repo → zipalign & sign → upload artifact → publish
sebagai GitHub Release. Butuh secret `ANDROID_KEYSTORE_BASE64`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_KEYSTORE_PASSWORD`,
dan `GIT_PUSH_TOKEN` (untuk commit balik file counter versi) sudah di-set
di repo.

## Struktur folder

Package: `app/src/main/java/com/aumofinance/app/`

| Folder | Fungsi |
|---|---|
| `auth/` | Login (screen, viewmodel, API) + helper biometrik |
| `coa/` | Chart of Accounts (daftar akun) |
| `core/` | Kelas `Application`, formatter mata uang, `SyncManager` (placeholder sinkronisasi offline, belum diimplementasikan) |
| `crashlog/` | Penangkap crash kustom (uncaught exception handler) + layar untuk melihat log crash tersimpan |
| `dashboard/` | Layar dashboard/ringkasan setelah login |
| `data/` | `DbConnectionManager` — pemantau status koneksi ke backend (heartbeat, karena Render free-tier bisa sleep). Heartbeat sengaja seumur proses aplikasi, bukan seumur satu Activity |
| `home/` | Menu utama aplikasi (`HomeActivity`/`HomeScreen`, Compose) |
| `journal/` | Input jurnal (journal entry): screen, viewmodel, API |
| `logout/` | Proses logout |
| `network/` | `ApiClient` (konfigurasi Ktor + base URL + header Authorization), `SessionManager` (sesi in-memory), `SessionStore` (persist sesi terenkripsi) |
| `periods/` | Manajemen periode akuntansi (buka/tutup periode) |
| `reports/` | Seluruh laporan, dipecah per jenis: `financials/` (Posisi Keuangan, Laba Rugi, Perubahan Modal, Arus Kas, Jurnal Penutup), `journal/` (Jurnal Umum & Penyesuaian), `ledger/` (Buku Besar permanent/temporary), `trialbalance/` (Neraca Saldo unadjusted/adjusted/post-closing), `worksheet/` (Kertas Kerja), `menu/` (navigasi ke semua laporan) |
| `settings/` | Pengaturan aplikasi |
| `splash/` | Splash screen, titik pemulihan sesi tersimpan saat app dibuka |
| `ui/icons/`, `ui/theme/` | Ikon (Tabler, via font glyph) dan tema Compose (`AumoColors`, dll) |
| `update/` | `AppUpdateService` — cek & pasang APK versi baru otomatis lewat GitHub Releases |

Di luar `app/`: `gradle/` (Gradle Wrapper), `build.gradle.kts` &
`settings.gradle.kts` (konfigurasi level proyek), `gradlew`/`gradlew.bat`
(wrapper script).

## Batasan platform

Hanya menyasar Android — tidak ada dan tidak direncanakan target iOS.
