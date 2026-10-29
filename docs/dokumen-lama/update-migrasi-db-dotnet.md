Berikut panduan langkah demi langkah (*step-by-step*) pengelolaan database berbasis **EF Core Migrations & Scaffolding** untuk proyek `AumoBackend`.

Anda bisa langsung menyalin dokumen Markdown ini dan menyimpannya di folder proyek Anda di **`/docs/DATABASE_GUIDE.md`**.

---

# Dokumentasi Pengelolaan Database & EF Core Migration

Dokumen ini berisi panduan standar untuk melakukan *scaffolding* (reverse engineering) skema database Neon PostgreSQL serta mengelola *schema migration* menggunakan Entity Framework Core di `AumoBackend`.

---

## 1. Persiapan Environment

Sebelum menjalankan perintah EF Core CLI, pastikan variabel lingkungan `ConnectionStrings__DefaultConnection` sudah dikonfigurasi di terminal lokal Anda.

### Git Bash (Windows)

```bash
export ConnectionStrings__DefaultConnection="Host=ep-wandering-bread-ao1sazxn.c-2.ap-southeast-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=npg_SIwmzB1AdMk4;SSL Mode=Require;Trust Server Certificate=true;"

```

### PowerShell

```powershell
$env:ConnectionStrings__DefaultConnection="Host=ep-wandering-bread-ao1sazxn.c-2.ap-southeast-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=npg_SIwmzB1AdMk4;SSL Mode=Require;Trust Server Certificate=true;"

```

---

## 2. Scaffolding Tabel dari Database Neon (Reverse Engineering)

Gunakan langkah ini jika terdapat perubahan skema langsung di database Neon yang ingin disinkronkan kembali ke dalam kode C# (`AppDbContext` & `Models`).

Jalankan perintah ini dari direktori `/src/backend/asp-net-core`:

```bash
dotnet ef dbcontext scaffold "$ConnectionStrings__DefaultConnection" Npgsql.EntityFrameworkCore.PostgreSQL \
  --context AppDbContext \
  --context-dir Data \
  --output-dir Models \
  --schema public \
  --force \
  --no-onconfiguring

```

### Catatan Pasca-Scaffolding

1. Pastikan `Data/AppDbContext.cs` mewarisi `IdentityDbContext`:

```csharp
public partial class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>

```

1. Pastikan `OnModelCreating` memanggil `base.OnModelCreating(modelBuilder);` di baris pertama.

---

## 3. Membuat Migration Baru

Jika Anda melakukan perubahan pada *Entities* di C# atau ingin memperbarui skema:

1. Buat berkas *migration* baru:

```bash
dotnet ef migrations add <NamaMigration> --context AppDbContext

```

*Contoh:* `dotnet ef migrations add AddTransactionCategories --context AppDbContext`
2. Periksa berkas C# yang ter-generate di dalam direktori `Migrations/` untuk memastikan perubahan kolom/tabel sudah sesuai.

---

## 4. Menandai Migration Pertama sebagai Baseline (Khusus Database Lama)

Jika database Neon sudah berisi tabel sebelum migration dibuat, tandai migration pertama (`InitialCreate`) sebagai **Baseline** agar EF Core tidak mencoba membuat ulang tabel yang sudah ada:

1. Dapatkan `MigrationId` dari berkas migration yang dibuat.
2. Jalankan query SQL berikut langsung di Dashboard Neon Console / DBeaver:

```sql
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('<MigrationId_Anda>', '10.0.0');

```

---

## 5. Menerapkan Migration ke Database (Push)

### Opsi A: Eksekusi Manual via CLI (Lokal)

```bash
dotnet ef database update --context AppDbContext

```

### Opsi B: Eksekusi Otomatis saat Deployment (Production)

Aplikasi sudah dikonfigurasi di `Program.cs` untuk mengeksekusi migration secara otomatis saat *startup* kontainer:

```csharp
await context.Database.MigrateAsync();

```

---

## 6. Rollback / Undo Migration

* **Membatalkan migration lokal yang belum di-push ke database:**

```bash
dotnet ef migrations remove --context AppDbContext

```

* **Kembali ke versi migration tertentu di database:**

```bash
dotnet ef database update <NamaMigrationSebelumnya> --context AppDbContext

```
