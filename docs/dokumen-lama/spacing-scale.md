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

Dikerjakan bertahap dalam 4 fase, dari yang paling aman ke yang
paling berisiko visual:

1. **Fase 1 (trivial):** 2 hardcode `fontSize`/nilai literal
   di-refactor jadi rujukan token — nilai piksel tidak berubah.

2. **Fase 2 (root screen padding):** Padding root `DashboardScreen`,
   `HomeScreen`, `LoginScreen`, header `PeriodsScreen` — sebelumnya
   `20dp`/`28dp`/`14dp` — disamakan ke `AumoDimens.ScreenPadding`
   (16dp).

3. **Fase 3 (normalisasi spacing):** Semua titik horizontal/vertical
   spacing (`.padding()`, `Arrangement.spacedBy()`, `Spacer(height/
   width)`, `PaddingValues()`) yang bernilai `4/6/10/12/14dp`
   dinormalisasi ke `AumoDimens.SpacingSmall` (8dp) atau
   `SpacingLarge` (16dp), dengan aturan pembulatan: **<12dp → 8dp**,
   **≥12dp → 16dp**. Diterapkan di 15 layar.

4. **Fase 4 (button height & icon size):**
   - `AumoDimens.ButtonHeight` (48dp, via `Modifier.heightIn(min =
     ...)`) diterapkan ke **10 tombol aksi utama/standalone**
     (mis. Login, Logout, Submit, Tambah, Open new period).
   - **Sengaja dikecualikan:** `TextButton` di dalam
     `AlertDialog` (confirm/dismiss — 5 titik di `PeriodsScreen` dan
     `CoaScreen`), karena tinggi bawaan Material 3 sudah wajar untuk
     konteks dialog dan memaksa 48dp berisiko terlihat oversized
     tanpa bisa diverifikasi visual.
   - 3 ikon `trailingIcon` (`Selector`, `Calendar` di
     `JournalEntryScreen`) yang sebelumnya memakai ukuran bawaan
     komponen (18dp, tanpa `size=` eksplisit) diberi
     `AumoDimens.IconSmall` (20dp).
   - **Sengaja tidak disentuh:** ikon dengan `size=` eksplisit yang
     sudah ada sebelumnya (14/16/18/28/40dp) — ini keputusan desain
     yang sudah diambil sebelumnya (salah satunya bahkan didukung
     komentar kode soal target sentuh minimum Material 3), jadi
     tidak diubah tanpa verifikasi visual.
   - `OutlinedTextField` tidak diubah — tinggi bawaan Material 3
     (~56dp untuk single-line) sudah masuk rentang spesifikasi
     48–56dp tanpa perlu modifikasi.

**Yang masih di luar cakupan:** `TopAppBarHeight` dan
`BottomNavHeightMin/Max` belum punya tempat pakai — aplikasi ini
belum memakai komponen `TopAppBar`/`NavigationBar` Material 3 sama
sekali (setiap layar membuat header sendiri di body `Scaffold`).
Kedua token tetap tersedia sebagai rujukan untuk implementasi ke
depan bila komponen tersebut dibuat.

Semua perubahan di atas dilakukan tanpa akses Android SDK/emulator
untuk verifikasi visual. Perubahan dibatasi pada yang **aman secara
mekanis** (penamaan ulang tanpa ubah nilai) atau **berisiko rendah
dan terdokumentasi jelas** (perubahan nilai kecil dengan alasan
eksplisit di atas). Disarankan tetap dicek tampilannya di Android
Studio, khususnya hasil Fase 3 dan Fase 4.
