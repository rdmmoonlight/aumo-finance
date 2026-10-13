Proses pembuatan rute (route) baru secara manual di Hono berbasis TypeScript dengan arsitektur berstandar openapi/zod pada dasarnya mengikuti **4 langkah utama** (1 alur lengkap dari DB schema/DTO hingga pendaftaran di router utama):

---

### Flow Pembuatan Rute Manual

```
  [1. Define Schema/DTO]
   └── Buat Zod Schema untuk Request Body / Response Validation
            │
            ▼
  [2. Define Service & Logic]
   └── Buat fungsi bisnis di Service Layer (interaksi DB / Drizzle)
            │
            ▼
  [3. Define Route & Controller]
   └──Buat instance Hono Router / OpenAPIHono, pasang validator, panggil Service.
      OpenAPIHono` (atau `Hono`) dan middleware `zValidator
            │
            ▼
  [4. Register Route di Index]
   └── Mount sub-router ke router utama (app.route)

   5. Test pakai Vitest.
      Copas file services dan file2 yg dibutuhkan services tersebut.

```
### Ringkasan Aturan Penting

1. **Named Export Matching**: Pastikan variabel schema/middleware yang dibuat diekspor secara eksplisit (`export const ...`) agar saat di-import di route tidak menyebabkan runtime error `ReferenceError: X is not defined`.
2. **Strict SSOT**: Saat mengambil data di Service Layer, selalu rujuk dari `schema.ts` yang sudah membawa entitas tabel resmi.
3. **Penyelarasan Sub-path**:
* Jika didaftarkan sebagai `apiV1.route('/journals', journalRoute)`
* Dan di dalam `journalRoute` menggunakan `.post('/')`
* Maka URL akhirnya adalah `POST /api/v1/journals`.

### Ringkasan Urutan Kerja:
* Schema & Types (src/db/schema/periods.ts) \rightarrow Tentukan bentuk datanya.
* Service (src/services/period.ts) \rightarrow Tempatkan logika bisnisnya.
*;Route (src/routes/period.ts) \rightarrow Ekspos endpoint-nya lewat Hono Zod OpenAPI.
* Test (src/test/vitest/period.test.ts) \rightarrow Uji kodenya lewat Vitest.
