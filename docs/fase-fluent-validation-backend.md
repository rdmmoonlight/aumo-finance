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

### Fase 4 — Chart of Accounts

| Request | File DTO | Controller | Pekerjaan |
|---|---|---|---|
| `CreateAccountRequest` | `DTOs/ChartOfAccountsDto.cs` | `ChartOfAccountsController.CreateAccount` (±134) | Kode akun numerik, nama wajib, kategori valid |
| `UpdateAccountRequest` | `DTOs/ChartOfAccountsDto.cs` | `ChartOfAccountsController.UpdateAccount` (±191) | Aturan sama dengan Create |
| `CreateAccountRequestDto`, `UpdateAccountRequestDto` | `DTOs/ChartOfAccountsDto.cs` | Tidak dipakai controller | Periksa: duplikat DTO, hapus bila tidak terpakai |

### Fase 5 — Journal Entry (prioritas tinggi: integritas akuntansi)

| Request | File DTO | Controller | Pekerjaan |
|---|---|---|---|
| `CreateJournalEntryRequest` | `DTOs/JournalEntryDto.cs` | `JournalEntryController.Create` (±94) | Tanggal wajib, minimal 2 baris, tiap baris debit **atau** kredit (bukan keduanya, tidak negatif), total debit = total kredit, `AccountId` wajib |
| `UpdateJournalEntryRequest` | `DTOs/JournalEntryDto.cs` | `JournalEntryController.Edit` (±166) | Aturan sama dengan Create |
| Query `q` | — | `SearchDescriptions` (±289) | Panjang maksimum |
| Query `journalType`, `entryDate` | — | `GetNextTransactionNumber` (±320) | Nilai `journalType` dalam daftar yang diizinkan |

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
