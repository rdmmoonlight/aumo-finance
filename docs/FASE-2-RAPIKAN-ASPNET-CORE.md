# Fase 2 — Rapikan dan Perkuat ASP.NET Core

Prinsip: **jangan pecah sistem yang belum rapi. Rapikan dulu, baru pertimbangkan pemisahan jika memang terpaksa.**

Lingkup: `backend/asp-net-core` (±12.450 baris C# di luar migrasi). Perilaku API tidak boleh berubah selama fase ini.

## 1. Kondisi Saat Ini (hasil pemeriksaan kode)

| No | Temuan | Lokasi | Dampak |
|---|---|---|---|
| 1 | Logika jurnal ganda: `JournalEntryController` (368 baris) memakai `AppDbContext` langsung, sementara `JournalEntryService` (306 baris) terdaftar di DI tetapi tidak dipakai controller mana pun | `Controllers/JournalEntryController.cs`, `Services/JournalEntries/` | Perbaikan harus dilakukan dua kali; layanan tidak teruji karena tidak terpakai |
| 2 | Import jurnal ganda: `ToolsController` (374 baris) dan `ToolsService` (303 baris) memuat alur yang sama | `Controllers/ToolsController.cs`, `Services/Tools/ToolsService.cs` | Sama seperti no. 1 |
| 3 | Penulisan `GeneralJournals` tersebar di 8 titik: JournalEntryController, JournalsController (hapus), ToolsController, ToolsService, PeriodsService (2), JournalEntryService | lihat kolom lokasi | Aturan jurnal tidak punya satu pintu |
| 4 | Kunci periode tidak seragam: jurnal biasa memakai `PeriodLock.IsDateLocked` (berdasarkan tanggal), hapus jurnal penyesuaian hanya memeriksa periode terpilih, import tidak memeriksa kunci periode | `JournalEntryController`, `JournalsController`, `ToolsService` | Entri dapat masuk atau terhapus di periode tertutup lewat jalur tertentu |
| 5 | `PeriodLock` memakai refleksi (`GetProperties`) padahal tipe `Period` sudah jelas; letaknya di `Models/ChartOfAccountsModel.cs` | `Models/ChartOfAccountsModel.cs` | Rapuh, lambat, sulit dibaca |
| 6 | Controller mengakses database langsung: JournalEntry (17 pemanggilan), ChartOfAccounts (13), Periods (9), Dashboard (8), Journals (5) | `Controllers/` | Logika bisnis bercampur dengan lapisan API |
| 7 | Dua DbContext: `AppDbContext` dan `NeondbContext` (hanya 3 tabel neraca saldo) | `Data/`, `Models/NeondbContext.cs` | Batas data tidak jelas |
| 8 | Ledger dibangun ulang penuh per periode (hapus lalu isi) di dalam service laporan; aturan akun permanen/sementara berada di service yang sama | `Services/Reports/GeneralLedgers/GeneralLedgersService.cs` | Perhitungan sulit diuji tanpa database |
| 9 | `CreatePeriodAsync` ±260 baris dalam satu metode (dua mode setup, transaksi, saldo awal) | `Services/Periods/PeriodsService.cs` | Service gemuk |
| 10 | Belum ada proyek uji: `AumoBackend.Test` hanya berisi `test.txt`; paket xunit dan Moq berada di proyek utama | `backend/AumoBackend.Test/`, `AumoBackend.csproj` | Tidak ada jaring pengaman; paket uji ikut ke produksi |
| 11 | Sisa berkas: 7 skrip `fix-build*.js` di folder proyek; header hak cipta `PlaceholderCompany` | `backend/asp-net-core/` | Berantakan |

## 2. Aturan Kerja

1. Satu langkah = satu commit (atau satu PR kecil). Build harus hijau sebelum lanjut.
2. Perilaku API tetap. Respons, kode status, dan pesan tidak diubah, kecuali dicatat di bagian "Catatan Perubahan Perilaku" di bawah.
3. Tulis tes **sebelum** memindahkan logika (tes karakterisasi), bukan sesudahnya.
4. Aturan dependensi arah masuk: `Api → Application → Domain`; `Infrastructure → Application/Domain`. `Domain` tidak mengenal EF Core, ASP.NET, maupun DTO.
5. Pisahkan lewat folder dan namespace lebih dulu. Proyek terpisah hanya jika aturan dependensi sulit dijaga.

## 3. Urutan Fase (dari termudah)

| Fase | Nama | Risiko | Ukuran |
|---|---|---|---|
| 2.1 | Bersih-bersih | Rendah | Kecil |
| 2.2 | Proyek uji dan tes pertama | Rendah | Kecil |
| 2.3 | Hapus logika ganda (Controller → Service) | Sedang | Sedang |
| 2.4 | Pusatkan aturan domain akuntansi | Sedang | Sedang |
| 2.5 | Jelaskan alur posting, kunci periode, dan ledger | Sedang | Besar |
| 2.6 | Susun lapisan Domain / Application / Infrastructure / Api | Sedang | Besar |
| 2.7 | Tetapkan batas modul Administrator dan Core Akuntansi | Sedang | Sedang |
| 2.8 | Penguatan akhir | Rendah | Sedang |

---

## Fase 2.1 — Bersih-bersih

Tujuan: mengurangi kebisingan sebelum perubahan struktur.

- [x] Hapus `fix-build.js`, `fix-build-step2.js`, `fix-build-v2.js` sampai `v5.js`, `fix-build-final.js` (pastikan tidak dirujuk `build.ninja` atau workflow).
- [ ] Ganti header `PlaceholderCompany` (atau hapus header; atur lewat `.editorconfig`/`stylecop` bila dipakai).
- [ ] Tinjau `#pragma warning disable CA1725`; perbaiki penamaan parameter atau pertahankan dengan alasan tertulis.
- [ ] Pindahkan `PeriodLock` dari `Models/ChartOfAccountsModel.cs` ke berkas sendiri (belum mengubah isi).
- [ ] Pindahkan paket `xunit`, `Moq`, `Microsoft.NET.Test.Sdk` keluar dari `AumoBackend.csproj` (ke proyek uji pada fase 2.2).

Selesai bila: build bersih, tidak ada berkas skrip sisa, `PeriodLock` punya berkas sendiri.

## Fase 2.2 — Proyek Uji dan Tes Pertama

Tujuan: jaring pengaman sebelum logika dipindahkan.

- [ ] Buat proyek `backend/AumoBackend.Test` (xunit) dan tambahkan ke `Backend.slnx`.
- [ ] Tes logika murni yang sudah ada:
  - `PeriodLock.IsDateLocked` (batas awal dan akhir periode, periode terbuka, daftar kosong)
  - `ValidateAndExtractLines` (kurang dari 2 baris, debit tidak sama kredit, total nol, baris kosong diabaikan)
  - `GeneralJournalWriter.BuildRows` (urutan `LineOrder`, status `Posted`)
  - Rentang nomor akun per tipe (`ValidateReferenceNumber`)
  - Perhitungan saldo berjalan ledger (`IsDebitNormal` dan akumulasi)
- [ ] Tes layanan dengan database uji (EF Core InMemory tidak cukup untuk fitur PostgreSQL; gunakan Testcontainers PostgreSQL atau SQLite untuk alur sederhana) untuk: buat jurnal, ubah jurnal, hapus jurnal, tutup periode.
- [ ] Tambahkan langkah `dotnet test` ke `code-quality.yml`.

Selesai bila: `dotnet test` hijau lokal dan di CI; setiap aturan di tabel temuan no. 4 punya tes yang menjelaskan perilaku saat ini (termasuk celahnya).

## Fase 2.3 — Hapus Logika Ganda

Tujuan: satu logika, satu tempat. Controller hanya menerjemahkan HTTP.

Urutan (dari yang paling jelas duplikat):

1. **JournalEntry**: ubah `JournalEntryController` agar memakai `IJournalEntryService`; hapus akses `db` dan semua logika dari controller. Samakan dulu perbedaan perilaku kedua versi (cocokkan lewat tes fase 2.2), lalu pertahankan satu.
2. **Tools (import jurnal)**: `ToolsController` memanggil `IToolsService`; hapus salinan logika di controller.
3. **ChartOfAccounts**: pindahkan 13 akses `db` dari controller ke `IChartOfAccountsService`.
4. **Periods**: pindahkan 9 akses `db` dari controller ke `IPeriodsService`.
5. **Journals (laporan)**: pindahkan hapus jurnal penyesuaian ke service.
6. **Dashboard**: pindahkan 8 akses `db` ke `IDashboardService`.

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

- [ ] Buat folder `Domain/` (namespace `AumoBackend.Domain`) tanpa ketergantungan EF Core atau ASP.NET.
- [ ] `PeriodLock`: ganti refleksi dengan akses langsung ke `Period` (atau antarmuka kecil `IPeriodRange`). Satu metode: `IsDateLocked(date, periods)`.
- [ ] `JournalEntry` (objek domain): metode pembuatan yang memeriksa
  - minimal dua baris bernilai,
  - total debit = total kredit dan tidak nol,
  - setiap baris hanya debit atau hanya kredit (periksa aturan saat ini; tambahkan bila belum ada),
  - nilai tidak negatif,
  - presisi desimal seragam (tetapkan jumlah desimal dan aturan pembulatan).
- [ ] `AccountType`: pindahkan `PermanentTypes`, `TemporaryTypes`, `IsDebitNormal`, dan rentang nomor akun ke Domain sebagai satu sumber.
- [ ] `Period`: perilaku `Close()` dan pemeriksaan "periode sebelumnya masih terbuka" menjadi aturan domain.
- [ ] Pesan kesalahan memakai kelas pengecualian domain (mis. `DomainRuleViolation`), bukan `ArgumentException` dan `InvalidOperationException` umum.

Selesai bila: seluruh aturan di atas punya tes unit tanpa database; Application hanya memanggil, tidak menulis ulang aturan.

## Fase 2.5 — Alur Posting, Kunci Periode, dan Ledger

Tujuan: alur jelas dan mudah diuji.

**Posting jurnal (satu pintu)**

- [ ] Buat `IJournalPostingService` dengan operasi: `Post`, `Replace`, `Remove`.
- [ ] Semua 8 titik penulisan `GeneralJournals` (temuan no. 3) wajib lewat pintu ini, termasuk import dan saldo awal periode.
- [ ] Pintu ini yang memeriksa: akun aktif milik pengguna, kunci periode berdasarkan tanggal (bukan periode terpilih), saldo seimbang, nomor transaksi.
- [ ] Putuskan perilaku import terhadap periode tertutup (saat ini tidak diperiksa). Samakan dengan jurnal biasa dan catat di "Catatan Perubahan Perilaku".

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
backend/asp-net-core/
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

| Modul | Isi |
|---|---|
| Administrator | Auth, Identity, Settings, Notifications, Avatars/Storage, Health |
| Core Akuntansi | ChartOfAccounts, JournalEntries, Periods, Reports, Tools (import) |
| Pembaca lintas modul | Home, Dashboard (hanya membaca, lewat antarmuka Core) |

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

| Kriteria | Ukuran |
|---|---|
| Controller tipis | Tidak ada `AppDbContext` di `Controllers/`; tidak ada controller di atas ±150 baris |
| Satu pintu posting | `GeneralJournals.Add/Remove` hanya di satu kelas |
| Kunci periode seragam | Semua jalur menolak tanggal di periode tertutup, dibuktikan tes |
| Domain murni | `Domain/` bebas dari EF Core dan ASP.NET |
| Batas modul | Administrator dan Core Akuntansi tidak saling menyentuh data |
| Testabilitas | Aturan domain punya tes unit tanpa database; alur utama punya tes integrasi |
| CI | `dotnet build` dan `dotnet test` hijau |

## 5. Catatan Perubahan Perilaku

Isi bagian ini bila ada perubahan yang terlihat dari luar.

| Tanggal | Perubahan | Alasan |
|---|---|---|
| (kosong) | | |

## 6. Pertanyaan Keputusan

Putuskan saat mencapai fasenya, lalu catat jawabannya di sini.

| No | Pertanyaan | Fase |
|---|---|---|
| 1 | Apakah import jurnal boleh masuk ke periode tertutup? (saat ini tidak diperiksa) | 2.5 |
| 2 | Apa syarat menutup periode (neraca seimbang, jurnal penutup, ledger segar)? | 2.5 |
| 3 | Ledger dibangun ulang per periode atau diperbarui saat posting? | 2.5 |
| 4 | Presisi dan pembulatan nominal (jumlah desimal)? | 2.4 |
| 5 | `NeondbContext` digabung atau tetap terpisah? | 2.7 |
| 6 | Perlu proyek terpisah per lapisan, atau cukup folder? | 2.6 |
