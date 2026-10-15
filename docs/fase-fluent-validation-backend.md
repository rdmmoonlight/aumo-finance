# Fase Penerapan FluentValidation — Backend (ASP.NET Core)

## 1. Status Saat Ini (Hasil Audit)

| Komponen | Status |
|---|---|
| Paket `FluentValidation.DependencyInjectionExtensions` 12.1.1 | Terpasang |
| `AddValidatorsFromAssemblyContaining<Program>()` | Terdaftar di `Program.cs` (scan otomatis, tidak perlu registrasi manual per validator) |
| `LoginRequestValidator` | Ada dan **dipakai** (`AuthController.Login`, `AuthService.ValidateLoginAsync`) |
| `CreatePeriodRequestValidator` | Dipakai di `PeriodsController.CreatePeriod` (Fase 3) |
| `GoogleLoginRequestValidator` | **Baru** (commit ini), dipakai di `AuthController.GoogleLogin` |
| `ValidationResultExtensions.ToErrorResponse()` | **Baru** (commit ini), format error seragam |

Format respons error (tidak berubah, aman untuk web dan mobile):

```json
{ "success": false, "message": "Validation failed.", "errors": ["..."] }
```

## 2. Pola Standar (acuan semua fase)

1. Buat `Validators/<Modul>/<NamaRequest>Validator.cs`, turunan `AbstractValidator<T>`.
2. Inject `IValidator<T>` ke controller.
3. Panggil di awal action:

```csharp
var validation = await _validator.ValidateAsync(request);
if (!validation.IsValid)
    return BadRequest(validation.ToErrorResponse());
```

4. Tambahkan `using AumoBackend.Validators.Common;` pada controller.
5. Tidak ada perubahan di `Program.cs`.

## 3. Fase Pengerjaan

### Fase 1 — Auth (selesai)

| Request | File DTO | Validator | Status |
|---|---|---|---|
| `LoginRequest` | `DTOs/AuthDto.cs` | `Validators/LoginRequestValidator.cs` | Selesai (sudah ada) |
| `GoogleLoginRequest` | `DTOs/AuthDto.cs` | `Validators/Auth/GoogleLoginRequestValidator.cs` | Selesai |

### Fase 2 — Auth: sisa pekerjaan (selesai)

| No | Pekerjaan | Hasil |
|---|---|---|
| 2.1 | Batasi `redirectTo` | Selesai. `GetSafeRedirectUrl` memakai `Helpers/AllowedOrigins.cs` (satu sumber dengan CORS). Daftar placeholder `app.domainsaya.com` dihapus |
| 2.2 | Hilangkan duplikasi `AuthController` vs `AuthService` | Selesai. Controller kini tipis dan memakai `IAuthService`. `AuthResponseDto` bertambah `IsLockedOut` dan `LockoutEnd` agar respons 429 tetap sama |
| 2.3 | DTO tidak terpakai | Selesai. `ResendRequest`, `MobileLoginRequest`, `MobileLoginResponse` dihapus dari backend |
| 2.4 | `ChangePasswordRequest` | Selesai. `Validators/Auth/ChangePasswordRequestValidator.cs`, dipasang di `SettingsController.ChangePassword` |

### Fase 3 — Periods (selesai)

| Request | Hasil |
|---|---|
| `CreatePeriodRequest` | Validator dipasang di `PeriodsController.CreatePeriod`. Aturan baru: `SetupMode` wajib valid, kode akun harus berbeda, nama maks. 100 karakter, saldo awal tidak negatif, akun LoadExisting tidak boleh sama |

Perubahan format error: `message` kini berisi error validasi pertama (sebelumnya selalu "Validation failed."), karena frontend menampilkan `error.data.message`. Array `errors` tetap lengkap.

### Fase 4 — Chart of Accounts (selesai)

| Request | Hasil |
|---|---|
| `CreateAccountRequest` | `Validators/ChartOfAccounts/CreateAccountRequestValidator.cs`, dipasang di `ChartOfAccountsController.CreateAccount` |
| `UpdateAccountRequest` | `Validators/ChartOfAccounts/UpdateAccountRequestValidator.cs`, dipasang di `UpdateAccount` (validasi kini dijalankan sebelum query akun) |

Aturan: nama wajib dan maks. 100 karakter; kategori harus salah satu dari 7 tipe; kode akun harus dalam rentang kategori (Assets 100–199, Liabilities 200–299, Equity 300–399, OperatingIncome 400–499, OperatingExpenses 500–599, OtherIncome 600–799, OtherExpenses 800–999, sama dengan frontend); role harus `Default`, `CashAndEquivalents`, atau `RetainedEarnings` (kosong diizinkan).

**Bug yang ditemukan dan diperbaiki:** `AccountClassificationHelper.ValidateReferenceNumber(string, int)` berisi `throw new NotImplementedException()`, sehingga Create dan Update akun selalu berakhir HTTP 500. Kini berisi pengecekan rentang yang sebenarnya.

Sisa pekerjaan manual (opsional):
- `Services/ChartOfAccounts/ChartOfAccountsService.cs` terdaftar di DI tetapi tidak dipakai controller (kasus sama seperti `AuthService` di Fase 2). Isinya masih memanggil stub `ValidateReferenceNumber(AccountClassification)` yang melempar `NotImplementedException`. Putuskan: controller memakai service ini, atau hapus service beserta `CreateAccountRequestDto`/`UpdateAccountRequestDto`.
- Stub lain di `Models/ChartOfAccountsModel.cs` yang masih melempar `NotImplementedException`: `IsTemporary(string)`, `IsPermanent(string)`, `ValidateReferenceNumber(AccountClassification)`. Hapus bila tidak dipakai.

### Fase 5 — Journal Entry (selesai)

| Request | Hasil |
|---|---|
| `CreateJournalEntryRequest` | `Validators/JournalEntries/CreateJournalEntryRequestValidator.cs`, dipasang di `JournalEntryController.Create` |
| `UpdateJournalEntryRequest` | `Validators/JournalEntries/UpdateJournalEntryRequestValidator.cs`, dipasang di `Edit` |

Aturan bersama (`JournalEntryValidatorBase` dan `JournalLineDtoValidator`), hanya untuk baris efektif (`AccountId != 0` dan ada debit/kredit; baris kosong dari form tetap diabaikan seperti sebelumnya):
- Tanggal antara 2000-01-01 dan 2100-12-31.
- `JournalType` kosong, `General`, atau `Adjusting`.
- `Lines` tidak null, maks. 200 baris, minimal 2 baris efektif.
- Total debit sama dengan total kredit dan lebih dari 0.
- Debit dan kredit tidak negatif, maks. 2 desimal (selaras `HasPrecision(18, 2)`), dan satu baris tidak boleh memiliki debit dan kredit sekaligus.
- Deskripsi baris maks. 250 karakter.

Cek yang membutuhkan database tetap di controller: akun aktif milik user dan periode tertutup. Cek jumlah baris dan total yang lama di controller dihapus karena sudah dicakup validator.

Belum dikerjakan (masuk Fase 7): query `q` pada `SearchDescriptions`, serta `journalType` dan `entryDate` pada `GetNextTransactionNumber`.

### Fase 6 — Settings & Tools

| Request | File DTO | Controller | Pekerjaan |
|---|---|---|---|
| `UpdateProfileRequest` | `DTOs/SettingsDto.cs` | `SettingsController.UpdateProfile` (±46) | `UserName` 3–50 karakter dan format valid, `PhoneNumber` format, `Bio` maks. 500, `AvatarUrl` URL absolut |
| `IFormFile` avatar | — | `SettingsController.UploadAvatar` (±90) | Ukuran maks., ekstensi dan content-type gambar |
| `JournalImportRequestDto` | `DTOs/ToolsDto.cs` | `ToolsController.PreviewJournalImport` (±79), `ImportJournalEntries` (±208) | Daftar baris tidak kosong, batas jumlah baris, tiap baris mengikuti aturan jurnal Fase 5 |

### Fase 7 — Parameter Query (prioritas rendah)

| Endpoint | Parameter | Aturan |
|---|---|---|
| `NotificationsController.GetMyNotifications` | `limit` | 1–100 |
| `DashboardController.GetDashboardData` | `period` | `daily`/`weekly`/`monthly`/`yearly` |
| `HomeController.GetKurs` | `baseCurrency`, `targetCurrency` | 3 huruf (ISO 4217) |
| `ChartOfAccountsController.GetAccounts` | `search`, `category` | Panjang maks., kategori valid |
| `FinancialStatementsController.GetStatementOfFinancialPosition` | `isPostClosing` | Tidak perlu (bool) |

Untuk parameter query, gunakan model `record`/class kecil dengan `[AsParameters]`/`[FromQuery]` agar dapat divalidasi, atau cek langsung di action bila hanya satu parameter.

## 4. Checklist per Fase

- [ ] Validator dibuat di `Validators/<Modul>/`
- [ ] `IValidator<T>` di-inject ke controller
- [ ] Validasi dipanggil di awal action dan mengembalikan `ToErrorResponse()`
- [ ] `dotnet build` bersih
- [ ] Uji manual: request valid (200/201) dan tidak valid (400 dengan array `errors`)
- [ ] Frontend/mobile menampilkan `errors` dengan benar
- [ ] Commit per fase
