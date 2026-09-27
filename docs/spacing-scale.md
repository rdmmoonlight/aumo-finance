# Skala Density & Ruang Layar — Aumo Finance (Mobile)

Dokumen ini mencatat token ukuran padding, spacing, tinggi komponen,
dan ikon untuk aplikasi mobile Aumo Finance (Jetpack Compose).

## Lokasi Implementasi

- File: `mobile/app/src/main/java/com/aumofinance/app/ui/theme/Dimens.kt`
- Objek: `AumoDimens`

## Tabel Spesifikasi

| Elemen              | Ukuran   | Konstanta                                    |
|---------------------|----------|-----------------------------------------------|
| Screen padding       | 16dp     | `AumoDimens.ScreenPadding`                    |
| Card padding         | 16dp     | `AumoDimens.CardPadding`                      |
| Horizontal spacing   | 8–16dp   | `AumoDimens.SpacingSmall` / `SpacingLarge`    |
| Vertical spacing     | 8–16dp   | `AumoDimens.SpacingSmall` / `SpacingLarge`    |
| Button height        | 48dp     | `AumoDimens.ButtonHeight`                     |
| Input height         | 48–56dp  | `AumoDimens.InputHeightMin` / `InputHeightMax`|
| Icon standard        | 24dp     | `AumoDimens.IconStandard`                     |
| Icon small           | 20dp     | `AumoDimens.IconSmall`                        |
| Top app bar          | 56dp     | `AumoDimens.TopAppBarHeight`                  |
| Bottom navigation    | 64–80dp  | `AumoDimens.BottomNavHeightMin` / `Max`       |

Rentang (8–16dp, 48–56dp, 64–80dp) sengaja direpresentasikan sebagai
dua konstanta (`*Small`/`*Large` atau `*Min`/`*Max`), bukan angka
bebas, agar tetap type-safe dan konsisten dipakai di seluruh layar.

## Rujukan

- Ukuran target sentuh minimum 48dp dan tinggi Top App Bar 56dp
  mengikuti Material Design 3:
  https://m3.material.io/foundations/layout/understanding-layout/spacing
  https://m3.material.io/components/top-app-bar/specs
- Tinggi Bottom Navigation 64–80dp mengikuti spesifikasi Material 3
  Navigation Bar: https://m3.material.io/components/navigation-bar/specs
- Spesifikasi angka (screen/card padding, spacing, icon size)
  disediakan langsung oleh pemilik proyek.

## Status Implementasi & Catatan Penting

1. **Token dasar (`AumoDimens`) sudah dibuat dan siap dipakai di
   seluruh proyek** — ini adalah satu-satunya sumber kebenaran untuk
   nilai-nilai di atas.

2. **Refactor yang sudah diterapkan (aman, tanpa mengubah tampilan):**
   Semua pemanggilan `.padding(...)`, `Arrangement.spacedBy(...)`, dan
   `PaddingValues(...)` yang nilainya **persis** `8.dp` atau `16.dp`
   diganti namanya menjadi `AumoDimens.SpacingSmall` /
   `AumoDimens.SpacingLarge`. Begitu juga dua pemanggilan ikon dengan
   `size = 20.dp` di `HomeScreen.kt` diganti menjadi
   `AumoDimens.IconSmall`. Ini murni penamaan ulang — **nilai piksel
   tidak berubah sama sekali**, jadi tidak ada risiko visual.

3. **Yang belum diterapkan, dan alasannya:** Kode `/mobile` saat ini
   memakai banyak nilai spacing ad-hoc yang **tidak** mengikuti skala
   ini — misalnya `4.dp`, `6.dp`, `10.dp`, `12.dp`, `18.dp`, dan
   `20.dp` dipakai bergantian untuk padding/spacing di berbagai layar
   (contoh: `LoginScreen.kt`, `HomeScreen.kt`, `PeriodsScreen.kt`).
   Begitu juga:
   - Belum ada komponen `TopAppBar` atau `NavigationBar` Material 3
     yang dipakai di aplikasi ini — setiap layar membuat header
     sendiri di dalam body `Scaffold`. Token `TopAppBarHeight` dan
     `BottomNavHeightMin/Max` karena itu belum punya tempat pakai;
     keduanya disediakan sebagai rujukan untuk implementasi ke depan.
   - Belum ditemukan `Button`/`OutlinedTextField` dengan tinggi
     eksplisit 48–56dp; saat ini mengikuti tinggi bawaan Material 3.
   
   Mengganti seluruh nilai ad-hoc tersebut menjadi `ScreenPadding`
   (16dp), `ButtonHeight` (48dp), dst., berarti **mengubah tampilan
   visual** banyak layar (mis. padding 20dp → 16dp). Perubahan seperti
   ini sebaiknya diverifikasi visual di Android Studio/emulator —
   yang tidak tersedia di lingkungan kerja ini (tidak ada Android SDK
   terpasang) — sehingga tidak dilakukan secara buta di sini untuk
   menghindari regresi tampilan yang tidak bisa diperiksa.

4. **Tindak lanjut yang disarankan:** terapkan `AumoDimens` ke setiap
   layar satu per satu (mis. dimulai dari `HomeScreen.kt` atau
   `LoginScreen.kt`), sambil dicek tampilannya di Android Studio.
   Saya bisa lanjutkan proses ini per-layar bila diminta.
