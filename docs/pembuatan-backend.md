Flow Pembuatan Endpoint Baru di NestJS (Berbasis Drizzle & Zod)Proses pembuatan rute/endpoint baru secara manual di arsitektur NestJS ini mengikuti 5 langkah utama (dari definisi skema database hingga registrasi modul ke aplikasi utama):Plaintext  [1. Define DB Schema & Zod DTO]
   └── Buat tabel di Drizzle (src/db/schema/) & Zod Schema untuk Request/Response (di src/modules/{module}/{module}.schemas.ts)
           │
           ▼
  [2. Define Service & Logic]
   └── Buat kelas @Injectable() untuk logika bisnis dan operasi DB (di src/modules/{module}/{module}.service.ts)
           │
           ▼
  [3. Define Controller]
   └── Buat @Controller() untuk handle rute HTTP (@Get, @Post) & pasang ZodValidationPipe (di src/modules/{module}/{module}.controller.ts)
           │
           ▼
  [4. Create & Register Module]
   └── Daftarkan Controller & Service ke dalam @Module(), lalu import ke app.module.ts
           │
           ▼
  [5. Test menggunakan Vitest]
   └── Tulis skenario pengujian endpoint di folder src/test/
Ringkasan Aturan PentingDependency Injection (DI): Pastikan setiap Service ditandai dengan @Injectable() dan di-inject melalui constructor di dalam Controller.Validasi Request dengan Zod: Alih-alih class-validator klasik NestJS, gunakan Zod schema yang dieksekusi melalui custom pipe (@UsePipes(new ZodValidationPipe(schema))) yang sudah ada di src/common/pipes/zod-validation.pipe.ts.Modularitas Tegas: Setiap entitas bisnis (misal: periods, auth) harus memiliki foldernya sendiri di src/modules/ yang minimal berisi controller.ts, service.ts, dan module.ts.Penyelarasan Sub-path:Path dasar rute ditentukan di Controller: @Controller('periods')Path spesifik di method: @Post('new')Gabungan keduanya menghasilkan rute aktual: POST /periods/new (atau /api/periods/new jika ada global prefix di main.ts).Ringkasan Urutan Kerja (Contoh Modul: Periods)DB Schema (src/db/schema/periods.ts) $\rightarrow$ Definisikan struktur tabel PostgreSQL menggunakan Drizzle.Zod DTO (src/modules/periods/periods.schemas.ts) $\rightarrow$ Definisikan Zod object untuk validasi body request atau response.Service (src/modules/periods/periods.service.ts) $\rightarrow$ Tulis logika bisnis dan query database menggunakan instance Drizzle.Controller (src/modules/periods/periods.controller.ts) $\rightarrow$ Ekspos endpoint HTTP, injeksi Service, dan terapkan pipe Zod.Module (src/modules/periods/periods.module.ts) $\rightarrow$ Bungkus Controller dan Service dalam satu modul.App Module (src/app.module.ts) $\rightarrow$ Tambahkan PeriodsModule ke array imports.Test (src/test/periods.ts) $\rightarrow$ Uji Controller dan Service menggunakan Vitest dan utilitas @nestjs/testing.

ASP .NET CORE
Pendekatan Shared Library / FFI (cdylib) — Paling Cepat & Ringan
Dipakai jika service Rust berfungsi sebagai modul komputasi berat (perhitungan akuntansi, kriptografi, pemrosesan file) yang dipanggil langsung oleh ASP.NET Core tanpa jalur jaringan/HTTP.

Sisi Rust (Cargo.toml):
Set crate-type = ["cdylib"] dan gunakan #[no_mangle] pub extern "C" pada fungsi yang diekspor.

Sisi C# (.NET):
Gunakan [LibraryImport("nama_library")] atau [DllImport] untuk memanggil fungsi C-native Rust secara in-memory.

Deployment:
Dilekatkan ke dalam build pipeline .NET (seperti yang sudah kita konfigurasikan di .csproj), sehingga menghasilkan satu image Docker yang ringkas.
