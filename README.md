Aumo Finance

An integrated, precision-driven financial and accounting information system.

/backend
- ada 2 jenis auth. cookie untuk web dan JWT barier untuk mobile.

/mobile
- Android native (Kotlin), bukan React Native/Flutter/MAUI. Konsumen REST API `/backend` di repo yang sama, auth pakai JWT Bearer.

Tech stack:
- Bahasa: Kotlin, JDK 17
- Build: Gradle Kotlin DSL (`build.gradle.kts`), Android Gradle Plugin 8.5.0, Gradle Wrapper (`./gradlew`, tidak butuh Android Studio untuk build)
- SDK: `minSdk` 28 (Android 9, dikunci — tidak boleh dinaikkan tanpa instruksi eksplisit), `targetSdk`/`compileSdk` 34
- UI: campuran View/XML lama (Material Components, ConstraintLayout) + Jetpack Compose (Material3) untuk layar baru — migrasi bertahap, belum 100% Compose
- Networking: Ktor Client (engine OkHttp) + Gson sebagai serializer, menggantikan Retrofit lama. Base URL backend: `https://aumonext-api.onrender.com`
- Sesi: `EncryptedSharedPreferences` (AES256-GCM via Android Keystore) untuk "ingat saya", `BiometricPrompt` untuk login sidik jari/wajah
- Async: Kotlinx Coroutines
- Lint: ktlint (plugin `org.jlleitschuh.gradle.ktlint`)
- CI/CD: GitHub Actions (`.github/workflows/android-build.yml`) — build, sign (keystore dari secret), dan publish APK ke GitHub Releases, trigger manual (`workflow_dispatch`)
- `applicationId`: `com.bnrc.aumofinance` (harus tetap sama dengan app MAUI lama supaya Play Store menganggap ini update, bukan aplikasi baru)

Struktur folder (`app/src/main/java/com/aumofinance/app/`), per fungsi:
- `auth/` — login (screen, viewmodel, API call) + helper biometrik
- `coa/` — Chart of Accounts (daftar akun)
- `core/` — kelas `Application`, formatter mata uang, `SyncManager` (placeholder sinkronisasi offline, belum diimplementasikan)
- `crashlog/` — penangkap crash kustom (uncaught exception handler) + layar untuk melihat log crash tersimpan
- `dashboard/` — layar dashboard/ringkasan setelah login
- `data/` — `DbConnectionManager`, pemantau status koneksi ke backend (heartbeat, karena Render free-tier bisa sleep)
- `home/` — menu utama aplikasi
- `journal/` — input jurnal (journal entry): screen, viewmodel, API
- `logout/` — proses logout
- `network/` — `ApiClient` (konfigurasi Ktor + base URL + header Authorization), `SessionManager` (sesi in-memory selama app berjalan), `SessionStore` (persist sesi terenkripsi)
- `periods/` — manajemen periode akuntansi (buka/tutup periode)
- `reports/` — seluruh laporan, dipecah per jenis:
  - `financials/` — Laporan Posisi Keuangan, Laba Rugi, Perubahan Modal, Arus Kas, Jurnal Penutup
  - `journal/` — laporan Jurnal Umum & Jurnal Penyesuaian
  - `ledger/` — Buku Besar (permanent/akun riil dan temporary/akun nominal)
  - `trialbalance/` — Neraca Saldo (unadjusted, adjusted, post-closing)
  - `worksheet/` — Kertas Kerja (worksheet)
  - `menu/` — menu navigasi ke semua laporan di atas
- `settings/` — pengaturan aplikasi
- `splash/` — splash screen, titik pemulihan sesi tersimpan saat app dibuka
- `ui/icons/`, `ui/theme/` — ikon (Tabler, via font glyph) dan tema Compose
- `update/` — `AppUpdateService`, pengecekan & pemasangan APK versi baru otomatis lewat GitHub Releases

Di luar `app/`: `gradle/` (Gradle Wrapper), `build.gradle.kts` & `settings.gradle.kts` (konfigurasi level proyek), `gradlew`/`gradlew.bat` (wrapper script).
