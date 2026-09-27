# Skala Tipografi — Aumo Finance (Mobile)

Dokumen ini mencatat ukuran font (`fontSize`) yang diterapkan pada
`Typography` Jetpack Compose Material 3 aplikasi Aumo Finance.

## Lokasi Implementasi

- File: `mobile/app/src/main/java/com/aumofinance/app/ui/theme/Theme.kt`
- Objek: `AumoTypography` (dipakai oleh `AumoTheme`)
- Font family tetap `AptosFontFamily` (Aptos Regular/Bold), tidak diubah.

## Tabel Pemetaan

| Peran (Aumo)         | Gaya Compose     | Ukuran | Keterangan            |
|----------------------|------------------|--------|------------------------|
| Display              | `displayLarge`   | 32sp   | H1 besar               |
| H1 / Page title      | `headlineLarge`  | 28sp   |                        |
| H2                    | `headlineMedium` | 24sp   |                        |
| H3 / Section          | `headlineSmall`  | 20sp   |                        |
| H4                    | `titleLarge`     | 18sp   |                        |
| Body utama            | `titleMedium`    | 16sp   |                        |
| UI / navigation       | `bodyLarge`      | 16sp   |                        |
| Secondary             | `bodyMedium`     | 14sp   |                        |
| Caption / metadata    | `bodySmall`      | 13sp   |                        |
| Label kecil           | `labelMedium`    | 12sp   | lihat catatan di bawah |
| —                     | `labelSmall`     | 11sp   | lihat catatan di bawah |

Gaya yang tidak disebutkan secara eksplisit pada instruksi asal
(`displayMedium`, `displaySmall`, `titleSmall`, `labelLarge`) tidak
diubah dan tetap mengikuti ukuran bawaan Material 3 Type Scale.

## Catatan Interpretasi

Instruksi asal menandai dua baris terakhir sebagai "custom" dengan
ukuran 12sp ("Label kecil") dan 11sp tanpa nama peran eksplisit.
Kedua ukuran ini persis sama dengan nilai bawaan Material 3 untuk
`labelMedium` (12sp) dan `labelSmall` (11sp). Karena Material 3
`Typography` tidak menyediakan slot "custom" di luar 15 gaya baku,
kedua baris tersebut dipetakan ke:

- `labelMedium` → 12sp (Label kecil)
- `labelSmall` → 11sp (Caption/metadata level label terkecil)

Nilai `fontSize` tetap ditulis eksplisit pada kedua gaya ini
(bukan dibiarkan default implisit) agar skala tipografi Aumo
konsisten dan terdokumentasi penuh dalam satu definisi.

## Rujukan

- Spesifikasi ukuran: instruksi internal tim Aumo Finance (disediakan
  langsung oleh pemilik proyek).
- Struktur 15 gaya (`display*`, `headline*`, `title*`, `body*`,
  `label*`) mengikuti Material Design 3 Type Scale:
  https://m3.material.io/styles/typography/type-scale-tokens
- Implementasi: `androidx.compose.material3.Typography.copy(...)`
  pada `mobile/app/src/main/java/com/aumofinance/app/ui/theme/Theme.kt`.
