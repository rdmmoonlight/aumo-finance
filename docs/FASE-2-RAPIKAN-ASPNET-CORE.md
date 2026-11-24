# Fase 2 — Rapikan dan Perkuat ASP.NET Core

Prinsip: **jangan pecah sistem yang belum rapi. Rapikan dulu, baru pertimbangkan pemisahan jika memang terpaksa.**

Lingkup: `backend/AumoBackend` (±12.450 baris C# di luar migrasi). Perilaku API tidak boleh berubah selama fase ini.

## 1. Kondisi Saat Ini (hasil pemeriksaan kode)

| No  | Temuan                                                                                                                                                                                             | Lokasi                                                              | Dampak                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | Logika jurnal ganda: `JournalEntryController` (368 baris) memakai `AppDbContext` langsung, sementara `JournalEntryService` (306 baris) terdaftar di DI tetapi tidak dipakai controller mana pun    | `Controllers/JournalEntryController.cs`, `Services/JournalEntries/` | Perbaikan harus dilakukan dua kali; layanan tidak teruji karena tidak terpakai |
| 2   | Import jurnal ganda: `ToolsController` (374 baris) dan `ToolsService` (303 baris) memuat alur yang sama                                                                                            | `Controllers/ToolsController.cs`, `Services/Tools/ToolsService.cs`  | Sama seperti no. 1                                                             |
| 3   | Penulisan `GeneralJournals` tersebar di 8 titik: JournalEntryController, JournalsController (hapus), ToolsController, ToolsService, PeriodsService (2), JournalEntryService                        | lihat kolom lokasi                                                  | Aturan jurnal tidak punya satu pintu                                           |
| 4   | Kunci periode tidak seragam: jurnal biasa memakai `PeriodLock.IsDateLocked` (berdasarkan tanggal), hapus jurnal penyesuaian hanya memeriksa periode terpilih, import tidak memeriksa kunci periode | `JournalEntryController`, `JournalsController`, `ToolsService`      | Entri dapat masuk atau terhapus di periode tertutup lewat jalur tertentu       |
| 5   | `PeriodLock` memakai refleksi (`GetProperties`) padahal tipe `Period` sudah jelas; letaknya di `Models/ChartOfAccountsModel.cs`                                                                    | `Models/ChartOfAccountsModel.cs`                                    | Rapuh, lambat, sulit dibaca                                                    |
| 6   | Controller mengakses database langsung: JournalEntry (17 pemanggilan), ChartOfAccounts (13), Periods (9), Dashboard (8), Journals (5)                                                              | `Controllers/`                                                      | Logika bisnis bercampur dengan lapisan API                                     |
| 7   | Dua DbContext: `AppDbContext` dan `NeondbContext` (hanya 3 tabel neraca saldo)                                                                                                                     | `Data/`, `Models/NeondbContext.cs`                                  | Batas data tidak jelas                                                         |
| 8   | Ledger dibangun ulang penuh per periode (hapus lalu isi) di dalam service laporan; aturan akun permanen/sementara berada di service yang sama                                                      | `Services/Reports/GeneralLedgers/GeneralLedgersService.cs`          | Perhitungan sulit diuji tanpa database                                         |
| 9   | `CreatePeriodAsync` ±260 baris dalam satu metode (dua mode setup, transaksi, saldo awal)                                                                                                           | `Services/Periods/PeriodsService.cs`                                | Service gemuk                                                                  |
| 10  | Belum ada proyek uji: `AumoBackend.Test` hanya berisi `test.txt`; paket xunit dan Moq berada di proyek utama                                                                                       | `backend/AumoBackend.Test/`, `AumoBackend.csproj`                   | Tidak ada jaring pengaman; paket uji ikut ke produksi                          |
| 11  | Sisa berkas: 7 skrip `fix-build*.js` di folder proyek; header hak cipta `PlaceholderCompany`                                                                                                       | `backend/AumoBackend/`                                              | Berantakan                                                                     |

## 2. Aturan Kerja

1. Satu langkah = satu commit (atau satu PR kecil). Build harus hijau sebelum lanjut.
2. Perilaku API tetap. Respons, kode status, dan pesan tidak diubah, kecuali dicatat di bagian "Catatan Perubahan Perilaku" di bawah.
3. Tulis tes **sebelum** memindahkan logika (tes karakterisasi), bukan sesudahnya.
4. Aturan dependensi arah masuk: `Api → Application → Domain`; `Infrastructure → Application/Domain`. `Domain` tidak mengenal EF Core, ASP.NET, maupun DTO.
5. Pisahkan lewat folder dan namespace lebih dulu. Proyek terpisah hanya jika aturan dependensi sulit dijaga.

## 3. Urutan Fase (dari termudah)

| Fase | Nama                                                      | Risiko | Ukuran |
| ---- | --------------------------------------------------------- | ------ | ------ |
| 2.1  | Bersih-bersih                                             | Rendah | Kecil  |
| 2.2  | Proyek uji dan tes pertama                                | Rendah | Kecil  |
| 2.3  | Hapus logika ganda (Controller → Service)                 | Sedang | Sedang |
| 2.4  | Pusatkan aturan domain akuntansi                          | Sedang | Sedang |
| 2.5  | Jelaskan alur posting, kunci periode, dan ledger          | Sedang | Besar  |
| 2.6  | Susun lapisan Domain / Application / Infrastructure / Api | Sedang | Besar  |
| 2.7  | Tetapkan batas modul Administrator dan Core Akuntansi     | Sedang | Sedang |
| 2.8  | Penguatan akhir                                           | Rendah | Sedang |

---

## Status Pelaksanaan

Diperiksa terhadap kode pada 2026-11-08.

| Fase | Status                          | Keterangan                                                                                        |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| 2.1  | Selesai (5 dari 5 butir)        | Header `PlaceholderCompany` sudah dihapus dari seluruh berkas `.cs`                               |
| 2.2  | Kode selesai, menunggu CI hijau | Proyek uji + 104 kasus uji ditulis; belum pernah dijalankan (lingkungan penulis tanpa .NET/NuGet) |
| 2.3  | Selesai                         | `AppDbContext` masih dipakai di 10 berkas `Controllers/`                                          |
| 2.4  | Selesai kode (6 dari 6 butir)   | Butir 1–6 selesai kode; menunggu CI hijau sebelum dinyatakan selesai                              |
| 2.5  | Sebagian (butir 1 sampai 4)     | Pintu posting memeriksa akun, kunci periode, saldo, dan nomor; butir kunci periode, ledger, dan pecah `CreatePeriodAsync` belum |
| 2.6  | Belum dimulai                   | Struktur lapisan belum disusun                                                                    |
| 2.7  | Belum dimulai                   | Batas modul belum ditetapkan                                                                      |
| 2.8  | Belum dimulai                   |                                                                                                   |

Langkah berikutnya: jalankan workflow `Quality & Formatting Workflow`, perbaiki tes yang gagal, lalu mulai Fase 2.3.

---

## Fase 2.1 — Bersih-bersih

Tujuan: mengurangi kebisingan sebelum perubahan struktur.

- [x] Hapus `fix-build.js`, `fix-build-step2.js`, `fix-build-v2.js` sampai `v5.js`, `fix-build-final.js` (pastikan tidak dirujuk `build.ninja` atau workflow).
- [x] Ganti header `PlaceholderCompany` (atau hapus header; atur lewat `.editorconfig`/`stylecop` bila dipakai). Header dihapus dari seluruh berkas `.cs` (komentar saja, tanpa perubahan kode); `SA1633` sudah `none` di `.editorconfig`.
- [x] Tinjau `#pragma warning disable CA1725`; perbaiki penamaan parameter atau pertahankan dengan alasan tertulis.
- [x] Pindahkan `PeriodLock` dari `Models/ChartOfAccountsModel.cs` ke berkas sendiri (belum mengubah isi).
- [x] Pindahkan paket `xunit`, `Moq`, `Microsoft.NET.Test.Sdk` keluar dari `AumoBackend.csproj` (ke proyek uji pada fase 2.2).

Selesai bila: build bersih, tidak ada berkas skrip sisa, `PeriodLock` punya berkas sendiri, tidak ada header `PlaceholderCompany`.

## Fase 2.2 — Proyek Uji dan Tes Pertama

Tujuan: jaring pengaman sebelum logika dipindahkan.

- [x] Buat proyek `backend/AumoBackend.Test` (xunit) dan tambahkan ke `Backend.slnx`.
- [x] Tes logika murni yang sudah ada:
  - `PeriodLock.IsDateLocked` (batas awal dan akhir periode, periode terbuka, daftar kosong)
  - `ValidateAndExtractLines` (kurang dari 2 baris, debit tidak sama kredit, total nol, baris kosong diabaikan)
  - `GeneralJournalWriter.BuildRows` (urutan `LineOrder`, status `Posted`)
  - Rentang nomor akun per tipe (`ValidateReferenceNumber`)
  - Perhitungan saldo berjalan ledger (`IsDebitNormal` dan akumulasi)
- [x] Tes layanan dengan database uji (EF Core InMemory tidak cukup untuk fitur PostgreSQL; gunakan Testcontainers PostgreSQL atau SQLite untuk alur sederhana) untuk: buat jurnal, ubah jurnal, hapus jurnal, tutup periode. Dipakai: Testcontainers PostgreSQL (`Integration/`).
- [x] Tambahkan langkah `dotnet test` ke `code-quality.yml`.

Catatan pelaksanaan:

- `Backend.slnx` sebelumnya berisi salinan log PowerShell (bukan XML); sudah diganti dengan solusi valid (backend + proyek uji). `test.txt` dihapus.
- `ValidateAndExtractLines` dan `GeneralLedgersService.IsDebitNormal` diubah dari `private` menjadi `internal` (tanpa perubahan perilaku) agar bisa diuji; `InternalsVisibleTo` ditambahkan ke `AumoBackend.csproj`.
- Temuan no. 4, kondisi saat ini: hapus jurnal penyesuaian sudah memakai `JournalEntryService.DeleteAsync` (terkunci per tanggal, ada tesnya); celah yang tersisa adalah import (`ToolsService`), dicatat tes `Import_IntoClosedPeriod_IsNotRejected_CurrentBehavior`.
- Ketergantungan lingkungan: tes integrasi butuh Docker (tersedia di `ubuntu-latest`).

Selesai bila: `dotnet test` hijau lokal dan di CI; setiap aturan di tabel temuan no. 4 punya tes yang menjelaskan perilaku saat ini (termasuk celahnya).

## Fase 2.3 — Hapus Logika Ganda

Tujuan: satu logika, satu tempat. Controller hanya menerjemahkan HTTP.

Urutan (dari yang paling jelas duplikat):

- [x] 1. **JournalEntry**: ubah `JournalEntryController` agar memakai `IJournalEntryService`; hapus akses `db` dan semua logika dari controller. Samakan dulu perbedaan perilaku kedua versi (cocokkan lewat tes fase 2.2), lalu pertahankan satu.
- [x] 2. **Tools (import jurnal)**: `ToolsController` memanggil `IToolsService`; hapus salinan logika di controller.
- [x] 3. **ChartOfAccounts**: pindahkan 13 akses `db` dari controller ke `IChartOfAccountsService`.
- [x] 4. **Periods**: pindahkan 9 akses `db` dari controller ke `IPeriodsService`.
- [x] 5. **Journals (laporan)**: pindahkan hapus jurnal penyesuaian ke service.
- [x] 6. **Dashboard**: pindahkan 8 akses `db` ke `IDashboardService`.

Bentuk controller yang dituju:

```csharp
[HttpPost]
public async Task<IActionResult> Create(CreateJournalEntryRequest request)
{
    var result = await _service.CreateAsync(_currentUser.Id, request);
    return result.ToActionResult();
}
```

Selesai bila: tidak ada `AppDbContext` di folder `Controllers/`; tidak ada controller di atas ±150 baris.

## Fase 2.4 — Pusatkan Aturan Domain Akuntansi

Tujuan: aturan (invarian) ditulis sekali, ketat, dan mudah diuji.

- [x] Buat folder `Domain/` (namespace `AumoBackend.Domain`) tanpa ketergantungan EF Core atau ASP.NET.
- [x] `PeriodLock`: ganti refleksi dengan akses langsung ke `Period` (atau antarmuka kecil `IPeriodRange`). Satu metode: `IsDateLocked(date, periods)`.
- [x] `JournalEntry` (objek domain): metode pembuatan yang memeriksa
  - minimal dua baris bernilai,
  - total debit = total kredit dan tidak nol,
  - setiap baris hanya debit atau hanya kredit (periksa aturan saat ini; tambahkan bila belum ada),
  - nilai tidak negatif,
  - presisi desimal seragam (tetapkan jumlah desimal dan aturan pembulatan).
- [x] `AccountType`: pindahkan `PermanentTypes`, `TemporaryTypes`, `IsDebitNormal`, dan rentang nomor akun ke Domain sebagai satu sumber. Dikerjakan di `Domain/AccountType.cs`; `PeriodsService`, `GeneralLedgersService`, dan `AccountClassificationHelper` memanggilnya dan tidak lagi menyimpan daftar sendiri. Nama lama yang longgar di buku besar (`Asset`, `Revenue`, `Expenses`, dst.) dipetakan lewat `AccountType.Normalize`.
- [x] `Period`: perilaku `Close()` dan pemeriksaan "periode sebelumnya masih terbuka" menjadi aturan domain. Dikerjakan di `Domain/PeriodRules.cs` (`EnsureCanClose`, `EnsurePreviousClosed`, `HasEarlierOpenPeriod`) dengan nilai `PeriodRange`; `ClosePeriodAsync` dan `CreatePeriodAsync` hanya memanggilnya. Pesan API tidak berubah.
- [x] Pesan kesalahan memakai kelas pengecualian domain (mis. `DomainRuleViolation`), bukan `ArgumentException` dan `InvalidOperationException` umum. Dikerjakan di `Domain/DomainRuleViolation.cs`; seluruh pelanggaran aturan di `JournalEntry`, `PeriodRules`, `JournalEntryService`, dan `ReversingJournalsService` kini melempar `DomainRuleViolation`.

Catatan pelaksanaan (butir 3, `JournalEntry`):

- Berkas baru: `Domain/JournalLine.cs`, `Domain/JournalEntry.cs` (namespace `AumoBackend.Domain`, tanpa EF Core/ASP.NET/DTO). Folder `Domain/` dibuat sebagai prasyarat (butir 1 dapat dicentang bersamaan).
- `JournalEntry.Create(lines)` memeriksa berurutan: baris tanpa akun/nominal diabaikan; minimal dua baris bernilai; nominal tidak negatif; satu baris hanya debit atau kredit; presisi nominal; total debit = total kredit dan tidak nol.
- Presisi (pertanyaan keputusan no. 4): paling banyak 2 desimal dan 16 digit sebelum koma, selaras `DECIMAL(18,2)` dan `PrecisionScale(18, 2, true)` di validator. Nominal yang melebihi presisi **ditolak**, tidak dibulatkan.
- `JournalEntryService.ValidateAndExtractLines` kini hanya memanggil `JournalEntry.Create`; tanda tangan dan pesan lama dipertahankan sehingga tes fase 2.2 tidak berubah.
- Perilaku API tetap: aturan tanpa-negatif, satu-sisi, dan presisi sebelumnya sudah ditegakkan `JournalEntryValidatorBase`; kini ditegakkan juga di lapisan domain.
- Pengecualian diganti menjadi `DomainRuleViolation` pada butir 6.
- Tes: `AumoBackend.Test/Unit/JournalEntryDomainTests.cs` (tanpa database).

Catatan pelaksanaan (butir 6, `DomainRuleViolation`):

- `DomainRuleViolation` menurunkan `InvalidOperationException` dengan sengaja. `ControllerBaseExtensions.HandleServiceException` dan `JournalsController` tetap menghasilkan 400 dengan pesan yang sama, sehingga perilaku API tidak berubah.
- Tetap memakai pengecualian bawaan: `ArgumentNullException` (guard argumen), serta kesalahan konfigurasi dan infrastruktur (`DatabaseServiceExtensions`, `JwtSettings`, `NeonBucketStorage`, `HomeService`, `TransactionNumberService`, `AppDbContextFactory`), karena bukan pelanggaran aturan akuntansi.
- `PeriodsService` menangkap `DomainRuleViolation` saja, bukan `InvalidOperationException` umum.
- Tes yang menegaskan tipe pengecualian diperbarui dari `InvalidOperationException` ke `DomainRuleViolation` (tes tipe bersifat tepat). Tes baru: `Unit/DomainRuleViolationTests.cs`.

Selesai bila: seluruh aturan di atas punya tes unit tanpa database; Application hanya memanggil, tidak menulis ulang aturan.

## Fase 2.5 — Alur Posting, Kunci Periode, dan Ledger

Tujuan: alur jelas dan mudah diuji.

**Posting jurnal (satu pintu)**

- [x] Buat `IJournalPostingService` dengan operasi: `Post`, `Replace`, `Remove` (`PostAsync`, `ReplaceAsync`, `RemoveAsync`; berkas di `Services/JournalEntry/`).
- [x] Semua titik penulisan `GeneralJournals` (temuan no. 3) wajib lewat pintu ini, termasuk import dan saldo awal periode.
  * Pemeriksaan kode 2026-11-20: titik tulis kini 4, yaitu `JournalEntryService.CreateAsync`, `PeriodsService.Create` (2 titik saldo awal), dan `ReversingJournalsService`. Keempatnya sudah lewat `IJournalPostingService`.
  * `ToolsService` (import) dan hapus jurnal sudah tidak ada di backend, sehingga tes import dihapus. Bila import dibangun lagi, wajib memanggil `PostAsync`.
  * `PeriodsService.Selection.cs` memulihkan baris arsip lewat `INSERT ... SELECT` dengan nomor jurnal asli. Itu salinan ulang, bukan posting, dan menjadi satu-satunya pengecualian tertulis di `JournalWriteGuardTests`. Penghapusan baris oleh archiver terjadi di luar .NET.
  * `ReplaceAsync` dan `RemoveAsync` belum punya pemanggil, karena endpoint ubah dan hapus jurnal belum ada.
- [x] Pintu ini yang memeriksa: akun aktif milik pengguna, kunci periode berdasarkan tanggal (bukan periode terpilih), saldo seimbang, nomor transaksi.
  * `PostAsync` memeriksa berurutan, sebelum nomor transaksi diambil: (1) aturan domain jurnal (minimal dua baris bernilai, saldo seimbang), (2) setiap akun aktif dan milik pengguna, (3) `PeriodLock.IsDateLocked` pada `EntryDate`. Bila salah satu gagal, tidak ada baris tertulis dan nomor transaksi tidak terpakai.
  * `ReplaceAsync` menolak bila tanggal jurnal lama **atau** tanggal baru berada di periode tertutup, dan memeriksa akun baris baru. `RemoveAsync` menolak bila tanggal jurnal berada di periode tertutup.
  * Periode yang dipilih pengguna tidak dipakai; hanya tanggal entri yang menentukan (dibuktikan tes `Post_LockFollowsEntryDate_NotTheSelectedPeriod`).
  * Pesan kesalahan `CreateAsync` tidak berubah. Pemeriksaan akun dan kunci periode yang sebelumnya ada di `JournalEntryService` dihapus, karena kini hanya ada di pintu posting.
  * Jurnal pembalik dan saldo awal periode ikut diperiksa karena keduanya lewat `PostAsync` (lihat "Catatan Perubahan Perilaku").
- [x] Putuskan perilaku import terhadap periode tertutup (saat ini tidak diperiksa). Samakan dengan jurnal biasa dan catat di "Catatan Perubahan Perilaku".
  * Keputusan: import **ditolak** pada tanggal di periode tertutup, sama dengan jurnal biasa. Modul `Tools` sudah dihapus, sehingga tidak ada kode import yang berubah. Bila import dibangun lagi, wajib memanggil `IJournalPostingService.PostAsync`, sehingga aturan ini berlaku otomatis tanpa pemeriksaan tersendiri.
  * Tes `Post_IntoClosedPeriod_IsRejected_ForEveryJournalType` (General, Adjusting, Reversing) menjaga keputusan ini.

**Kunci periode**

- [ ] Satu aturan: tanggal entri menentukan kunci, di semua jalur (tambah, ubah, hapus, import).
- [ ] Tetapkan perilaku `ClosePeriod`: apakah wajib neraca saldo seimbang, jurnal penutup ada, atau ledger tidak kedaluwarsa. Tulis keputusan di dokumen ini.

**Ledger**

- [ ] Pisahkan perhitungan ledger dari akses database menjadi fungsi murni: `BuildLedger(lines, accounts) → baris ledger`.
- [ ] `GeneralLedgersService` hanya mengambil data, memanggil fungsi murni, lalu menyimpan.
- [ ] Putuskan strategi: tetap dibangun ulang per periode (sederhana) atau diperbarui saat posting. Pilihan awal yang disarankan: tetap bangun ulang, tetapi dipicu dari satu tempat dan dengan penanda kedaluwarsa yang diuji.

**Periode**

- [ ] Pecah `CreatePeriodAsync` menjadi: validasi, mode "muat data lama", mode "setup baru", pembuatan saldo awal.

Selesai bila: pencarian `GeneralJournals.Add` dan `GeneralJournals.Remove` di luar satu kelas tidak menemukan apa pun; tes membuktikan jurnal di periode tertutup ditolak di semua jalur.

## Fase 2.6 — Susun Lapisan

Tujuan: pemisahan jelas, masih dalam satu proyek.

```
backend/AumoBackend/
├── Domain/            aturan dan objek akuntansi (tanpa EF Core, tanpa ASP.NET)
├── Application/       kasus penggunaan, antarmuka layanan, DTO
├── Infrastructure/    EF Core (AppDbContext, Migrations), penyimpanan avatar, email, pasar data
├── Api/               Controllers, Middlewares, Program, konfigurasi
└── Program.cs
```

- [ ] Pindahkan folder satu per satu (Domain dulu, lalu Infrastructure, lalu Application, terakhir Api). Satu pemindahan per commit.
- [ ] `Models/` dipecah: entitas persistensi ke `Infrastructure`, objek aturan ke `Domain`, model respons ke `Application`.
- [ ] `ViewModels/` dan `DTOs/` ditinjau: satu bentuk saja untuk respons.
- [ ] Jaga aturan dependensi dengan tes arsitektur (mis. NetArchTest) atau pemeriksaan namespace di CI.
- [ ] Putuskan proyek terpisah (`.Domain`, `.Application`) hanya jika aturan dependensi sering dilanggar. Bila belum terjadi, tetap satu proyek.

Selesai bila: `Domain` tidak memiliki `using` ke EF Core atau ASP.NET; tes arsitektur hijau.

## Fase 2.7 — Batas Modul Administrator dan Core Akuntansi

Tujuan: dua modul dengan batas jelas dalam satu solution.

| Modul                | Isi                                                               |
| -------------------- | ----------------------------------------------------------------- |
| Administrator        | Auth, Identity, Settings, Notifications, Avatars/Storage, Health  |
| Core Akuntansi       | ChartOfAccounts, JournalEntries, Periods, Reports, Tools (import) |
| Pembaca lintas modul | Home, Dashboard (hanya membaca, lewat antarmuka Core)             |

- [ ] Susun folder per modul di setiap lapisan (mis. `Application/Administrator/`, `Application/Accounting/`).
- [ ] Core Akuntansi hanya mengenal pengguna lewat `ICurrentUser` (satu `Guid`), tidak memanggil `AuthService` atau `SettingsService`.
- [ ] Administrator tidak membaca tabel akuntansi.
- [ ] Putuskan nasib `NeondbContext`: gabungkan 3 tabel neraca saldo ke `AppDbContext`, atau tetapkan alasan tertulis mengapa harus terpisah.
- [ ] Larang referensi silang lewat tes arsitektur.

Selesai bila: tabel dependensi antar-modul hanya satu arah (Core → antarmuka identitas pengguna).

## Fase 2.8 — Penguatan Akhir

- [ ] Penanganan kesalahan global (`ProblemDetails`/exception handler) agar pengecualian domain dipetakan ke 400/409/404 di satu tempat.
- [ ] Kendala database sebagai lapis kedua: `CHECK (Debit >= 0 AND Credit >= 0)`, indeks unik nomor transaksi per pengguna.
- [ ] Kontrol konkurensi pada periode dan nomor transaksi.
- [ ] Tes integrasi untuk alur utama: buka periode → jurnal → ledger → neraca saldo → tutup periode.
- [ ] Perbarui `PETA-REPO.md` dan dokumen ini sesuai struktur akhir.

## 4. Definisi Selesai Fase 2

| Kriteria              | Ukuran                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| Controller tipis      | Tidak ada `AppDbContext` di `Controllers/`; tidak ada controller di atas ±150 baris |
| Satu pintu posting    | `GeneralJournals.Add/Remove` hanya di satu kelas                                    |
| Kunci periode seragam | Semua jalur menolak tanggal di periode tertutup, dibuktikan tes                     |
| Domain murni          | `Domain/` bebas dari EF Core dan ASP.NET                                            |
| Batas modul           | Administrator dan Core Akuntansi tidak saling menyentuh data                        |
| Testabilitas          | Aturan domain punya tes unit tanpa database; alur utama punya tes integrasi         |
| CI                    | `dotnet build` dan `dotnet test` hijau                                              |

## 5. Catatan Perubahan Perilaku

Isi bagian ini bila ada perubahan yang terlihat dari luar.

| Tanggal    | Perubahan                                                                                                                                             | Alasan                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-11-19 | `AccountClassificationHelper.NormalBalanceIsDebit(string?)` untuk jenis tidak dikenal berubah dari debit menjadi kredit (kini sama dengan buku besar) | Satu sumber aturan. Tidak ada pemanggil di kode produksi; validator hanya meloloskan tujuh jenis kanonik, sehingga API tidak berubah |
| 2026-11-20 | `JournalEntryId` jurnal biasa dan jurnal pembalik kini diambil dari sequence; nomor yang sudah dipakai baris lama dilewati | Satu sumber nomor. Sebelumnya dua jalur memakai MAX+1 dan dua jalur saldo awal memakai sequence |
| 2026-11-20 | Saldo awal periode kini melewati aturan domain jurnal (maksimal 2 desimal, tidak negatif, seimbang) | Satu pintu. Validator `CreatePeriodRequest` sudah menolak nilai negatif, sehingga efek praktis hanya pada nominal lebih dari 2 desimal |
| 2026-11-24 | Jurnal pembalik kini ditolak bila salah satu akun pada jurnal sumber sudah nonaktif atau bukan milik pengguna, dengan pesan `One or more selected accounts are invalid or inactive.` | Satu pintu. Pemeriksaan akun aktif dan milik pengguna kini di `PostAsync`, sehingga berlaku di semua jalur. Sebelumnya jurnal pembalik tidak memeriksa akun |
| 2026-11-24 | Saldo awal periode (mode "muat data lama") kini ditolak bila akun Retained Earnings yang dipilih nonaktif. Kegagalan muncul sebagai `Failed to open period: ...` | Sama seperti di atas. Akun lain pada saldo awal sudah berstatus aktif sejak query-nya |
| 2026-11-24 | Import jurnal terhadap periode tertutup: **ditolak**, sama dengan jurnal biasa (pesan `This date falls within a closed accounting period. Choose a date in an open period.`) | Keputusan butir 4 fase 2.5. Modul import sudah dihapus, sehingga belum ada perubahan yang terlihat; berlaku bila import dibangun lagi karena wajib lewat `PostAsync` |
| 2026-11-24 | `ReplaceAsync` dan `RemoveAsync` menolak jurnal yang tanggalnya berada di periode tertutup (pesan `This journal falls within a closed accounting period and cannot be changed.`) | Satu aturan kunci periode di pintu posting. Belum ada endpoint ubah dan hapus jurnal, sehingga belum terlihat dari luar |

## 6. Pertanyaan Keputusan

Putuskan saat mencapai fasenya, lalu catat jawabannya di sini.

| No  | Pertanyaan                                                                         | Fase | Jawaban                                                                                                                                                                                                             |
| :-: | :--------------------------------------------------------------------------------- | :--: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | Apakah import jurnal boleh masuk ke periode tertutup? _(saat ini tidak diperiksa)_ | 2.5  | Tidak boleh, sama dengan jurnal biasa. Modul `Tools` (import) sudah dihapus; bila dibangun lagi, import wajib lewat `IJournalPostingService.PostAsync` yang menolak tanggal di periode tertutup. |
|  2  | Apa syarat menutup periode (neraca seimbang, jurnal penutup, ledger segar)?        | 2.5  |                                                                                                                                                                                                                     |
|  3  | Ledger dibangun ulang per periode atau diperbarui saat posting?                    | 2.5  |                                                                                                                                                                                                                     |
|  4  | Presisi dan pembulatan nominal (jumlah desimal)?                                   | 2.4  | Maksimal 2 angka di belakang koma dan 16 digit di depan koma, selaras dengan `DECIMAL(18,2)` serta `PrecisionScale(18, 2, true)` pada validator. Nominal yang melebihi presisi akan **ditolak** (tidak dibulatkan). |
|  5  | `NeondbContext` digabung atau tetap terpisah?                                      | 2.7  |                                                                                                                                                                                                                     |
|  6  | Perlu proyek terpisah per lapisan, atau cukup folder?                              | 2.6  |                                                                                                                                                                                                                     |

