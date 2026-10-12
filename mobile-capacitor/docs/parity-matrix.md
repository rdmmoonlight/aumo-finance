# Matriks Paritas & Kontrak API — Fase 1 (Baseline)

> Status: **Fase 1 selesai (pemetaan saja, tanpa perubahan kode).**
> Sumber kebenaran: `/mobile` (klien Kotlin) dan `/backend` (ASP.NET Core). Tidak ada folder lain yang dipakai.
> Tanggal baseline: 12 Oktober 2026.

---

## 1. Ringkasan Hasil

| Pos | Nilai |
|---|---|
| Layar (Activity) | 24 |
| Endpoint dipakai mobile | 31 |
| Endpoint terverifikasi ada di `/backend` | 30 |
| **Endpoint tidak ada di `/backend`** | **1** (`GET /api/v1/reports/trial-balance`) |
| Endpoint didefinisikan mobile tetapi tidak dipanggil layar | 2 (`auth/me`, `journal-entry/search-descriptions`) + 1 (`periods/clear-selection`) |
| Layar terdampak gap | 3 (Neraca Saldo: unadjusted, adjusted, post-closing) |

## 2. Temuan Kritis (Wajib Diputuskan Sebelum Fase 8)

| # | Temuan | Dampak | Tindakan yang dibutuhkan |
|---|---|---|---|
| T1 | `/backend/Controllers/Reports/TrialBalanceController.cs` hanya kerangka: rute `/api/v1/TrialBalance`, **tanpa action HTTP**. Mobile memanggil `GET /api/v1/reports/trial-balance?type=...` | 3 layar Neraca Saldo memperoleh 404 | Pemilik `/backend` menetapkan: (a) menambah endpoint di `/backend`, atau (b) mengubah kontrak. Aturan proyek: perubahan API masuk `/backend`, bukan di mobile |
| T2 | `Services/Reports/TrialBalances/TrialBalancesService.cs` dan `ViewModels/Reports/TrialBalanceViewModel.cs` sudah ada di `/backend` | Logika perhitungan tersedia, hanya belum terpasang ke rute | Jadi bahan keputusan T1 |
| T3 | Beranda memakai `GET /api/v1/periods` sebagai ping dan heartbeat 10 menit (bukan `/api/v1/health`) | Perilaku harus ditiru persis di Fase 4 | Pertahankan perilaku, nilai interval 10 menit |

## 3. Matriks Layar (24 Layar × Status)

Keterangan status baseline: **OK** = endpoint terverifikasi di `/backend`. **GAP** = endpoint tidak ada. **LOKAL** = tanpa API.
Status migrasi awal seluruh baris: **Belum**.

| # | Layar Kotlin | Rute target (React) | Endpoint dipakai | Baseline | Fase |
|---:|---|---|---|---|---:|
| 1 | SplashActivity | `/splash` | — (pulihkan sesi dari penyimpanan terenkripsi) | LOKAL | 5 |
| 2 | LoginActivity | `/login` | `POST auth/login` | OK | 5 |
| 3 | LogoutActivity | `/logout` | `POST auth/logout` (hasil diabaikan) | OK | 5 |
| 4 | HomeActivity | `/home` | `GET periods` (ping + heartbeat) | OK | 6 |
| 5 | DashboardActivity | `/dashboard` | `GET dashboard` | OK | 6 |
| 6 | PeriodsActivity | `/periods` | `GET periods`, `GET periods/open-info`, `POST periods`, `POST periods/select/{id}`, `POST periods/close/{id}` | OK | 6 |
| 7 | CoaActivity | `/coa` | `GET/POST chart-of-accounts`, `PUT/DELETE chart-of-accounts/{id}` | OK | 7 |
| 8 | JournalEntryActivity | `/journal/new`, `/journal/:id` | `GET journal-entry/{id}`, `POST create`, `PUT edit/{id}`, `DELETE delete/{id}`, `GET next-transaction-number`, `GET chart-of-accounts` | OK | 7 |
| 9 | ReportsMenuActivity | `/reports` | — (navigasi) | LOKAL | 8 |
| 10 | GeneralJournalReportActivity | `/reports/journal/general` | `GET reports/journals/general`, `DELETE journal-entry/delete/{id}` | OK | 8 |
| 11 | AdjustingJournalReportActivity | `/reports/journal/adjusting` | `GET reports/journals/adjusting`, `DELETE reports/journals/adjusting/{id}` | OK | 8 |
| 12 | GeneralLedgerPermanentActivity | `/reports/ledger/permanent` | `GET reports/general-ledgers/permanent` | OK | 8 |
| 13 | GeneralLedgerTemporaryActivity | `/reports/ledger/temporary` | `GET reports/general-ledgers/temporary` | OK | 8 |
| 14 | TrialBalanceActivity (unadjusted) | `/reports/trial-balance/unadjusted` | `GET reports/trial-balance?type=unadjusted` | **GAP (T1)** | 8 |
| 15 | AdjustedTrialBalanceActivity | `/reports/trial-balance/adjusted` | `GET reports/trial-balance?type=adjusted` | **GAP (T1)** | 8 |
| 16 | PostClosingTrialBalanceActivity | `/reports/trial-balance/post-closing` | `GET reports/trial-balance?type=post-closing` | **GAP (T1)** | 8 |
| 17 | WorksheetActivity | `/reports/worksheet` | `GET reports/worksheet` | OK | 8 |
| 18 | IncomeStatementActivity | `/reports/income-statement` | `GET reports/income-statement` | OK | 9 |
| 19 | RetainedEarningsActivity | `/reports/retained-earnings` | `GET reports/retained-earnings` | OK | 9 |
| 20 | FinancialPositionActivity | `/reports/financial-position` | `GET reports/statement-of-financial-position?isPostClosing=` | OK | 9 |
| 21 | ClosingJournalActivity | `/reports/closing-journal` | `GET reports/journals/closing` | OK | 9 |
| 22 | CashFlowActivity | `/reports/cash-flow` | `GET reports/statement-of-cash-flow` | OK | 9 |
| 23 | SettingsActivity | `/settings` | — (toggle auto-update, disimpan lokal) | LOKAL | 9 |
| 24 | CrashLogActivity | `/crashlog` | — (log lokal) | LOKAL | 4 |

Semua path di atas berawalan `/api/v1/`.

## 4. Kontrak Endpoint

Semua endpoint, kecuali login, membutuhkan header `Authorization: Bearer <token>`.
Seluruh respons berbentuk JSON dengan field `success`.

### 4.1 Autentikasi

| Method | Path | Request | Respons kunci |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password, rememberMe, isMobileClient: true, operatingSystem: "Android" }` | `{ success, message, userId?, fullName?, token? }` — field `token` hanya ada bila `isMobileClient = true` dan `success = true` |
| POST | `/auth/logout` | — | diabaikan |

### 4.2 Periode

| Method | Path | Request | Respons kunci |
|---|---|---|---|
| GET | `/periods` | — | `{ success, selectedPeriodId?, periods[{ id, periodName, startDate, endDate, isClosed }] }` |
| GET | `/periods/open-info` | — | `{ success, hasExistingPermanentAccounts, availableCashAndBankAccounts[], availableRetainedEarningsAccounts[], permanentAccounts[] }` |
| POST | `/periods` | `{ month, year, setupMode: "LoadExisting"\|"CreateNew", ... }` | `{ success, message }` |
| POST | `/periods/select/{id}` | — | `{ success, message }` |
| POST | `/periods/close/{id}` | — | `{ success, message }` |

Mode `LoadExisting`: `cashAccountId`, `bankAccountId`, `retainedEarningsAccountId`.
Mode `CreateNew`: `cashAccountCode/Name/Balance`, `bankAccountCode/Name/Balance`, `retainedEarningsAccountCode/Name`.

### 4.3 Bagan Akun (COA)

| Method | Path | Request | Respons kunci |
|---|---|---|---|
| GET | `/chart-of-accounts` | query `search?`, `category?` | `{ success, selectedPeriodName?, accounts[{ id, referenceNumber, accountName, type, role, isActive, balance }] }` |
| POST | `/chart-of-accounts` | `{ referenceNumber, accountName, type, role }` | `{ success, message }` |
| PUT | `/chart-of-accounts/{id}` | `{ referenceNumber, accountName, type, role, isActive }` | `{ success, message }` |
| DELETE | `/chart-of-accounts/{id}` | — | `{ success, message }` |

Aturan rentang nomor akun (validasi klien wajib setara):

| Type | Rentang |
|---|---|
| Assets | 100–199 |
| Liabilities | 200–299 |
| Equity | 300–399 |
| OperatingIncome | 400–499 |
| OperatingExpenses | 500–599 |
| OtherIncome | 600–799 |
| OtherExpenses | 800–999 |

`role`: `Default`, `CashAndEquivalents`, `RetainedEarnings`.

### 4.4 Jurnal Umum (Input)

| Method | Path | Request | Respons kunci |
|---|---|---|---|
| GET | `/journal-entry/{id}` | — | `{ success, entry{ id, transactionNumber, journalType, entryDate, createdAt, updatedAt?, isLocked, lines[] } }` |
| POST | `/journal-entry/create` | `{ journalType, entryDate, createdAt, lines[{ accountId, lineDescription?, debit, credit, lineOrder }] }` | `{ success, message, entryId?, transactionNumber? }` |
| PUT | `/journal-entry/edit/{id}` | `{ journalType, entryDate, updatedAt, lines[] }` | `{ success, message }` |
| DELETE | `/journal-entry/delete/{id}` | — | `{ success, message }` |
| GET | `/journal-entry/next-transaction-number` | query `journalType`, `entryDate?` | `{ success, transactionNumber }` |

`journalType` hanya `General` atau `Adjusting`. Jurnal Penutup **tidak pernah disimpan**.
`createdAt` / `updatedAt` = waktu lokal perangkat, tanpa zona waktu (Kind Unspecified).

### 4.5 Dashboard & Laporan

| Method | Path | Query | Respons kunci |
|---|---|---|---|
| GET | `/dashboard` | — | `totalAssets, totalLiabilities, totalEquity, totalRevenue, totalExpenses, netIncome, cashAccounts[], totalCashOnHand, bankAccounts[], totalBankBalance, isPeriodClosed` |
| GET | `/reports/journals/general` | — | `{ entries[], isPeriodClosed, hasPeriodSelected, selectedPeriodName }` |
| GET | `/reports/journals/adjusting` | — | bentuk sama |
| DELETE | `/reports/journals/adjusting/{id}` | — | `{ success, message }` |
| GET | `/reports/journals/closing` | — | `{ closingJournal{ netIncome, retainedEarningsAccountName, groups[] } }` |
| GET | `/reports/general-ledgers/permanent` | — | `{ isTemporary, accounts[{ beginningBalance, endingBalance, lines[] }] }` |
| GET | `/reports/general-ledgers/temporary` | — | sama + `netIncomeBeforeClosing` |
| GET | `/reports/trial-balance` | `type=unadjusted\|adjusted\|post-closing` | `{ reportTitle, totalDebit, totalCredit, isBalanced, rows[] }` — **GAP T1** |
| GET | `/reports/worksheet` | — | `{ rows[], totals{ ..., netIncome } }` |
| GET | `/reports/income-statement` | — | `revenueAccounts, expenseAccounts, operatingIncome, otherIncomeAccounts, otherExpenseAccounts, netIncome` |
| GET | `/reports/retained-earnings` | — | `beginningRetainedEarnings, netIncome, dividendsOrDraws, endingRetainedEarnings` |
| GET | `/reports/statement-of-financial-position` | `isPostClosing` (bool) | `assetAccounts, liabilityAccounts, equityAccounts, totals, isBalanced` |
| GET | `/reports/statement-of-cash-flow` | — | `operating/investing/financingActivities, netChangeInCash, beginningCash, endingCash` |

### 4.6 Di Luar Panggilan Layar Mobile

| Sumber | Endpoint / fungsi | Catatan |
|---|---|---|
| `AuthApi.me()` | `GET /auth/me` | Didefinisikan, tidak dipanggil |
| `JournalApi.searchDescriptions()` | `GET /journal-entry/search-descriptions?q=` | Didefinisikan, tidak dipanggil. Kandidat fitur saran deskripsi |
| `PeriodsApi.clearSelection()` | `POST /periods/clear-selection` | Didefinisikan, tidak dipanggil |
| `AppUpdateService` | GitHub API `repos/rdmmoonlight/aumo-finance/releases/latest` | Bukan `/backend`. Ditangani di Fase 9 |

## 5. Aturan Perilaku Lintas Layar (Wajib Setara)

| # | Aturan | Fase |
|---|---|---:|
| 1 | Base URL `https://aumonext-api.onrender.com`. Path selalu absolut diawali `/api/v1/...` | 4 |
| 2 | Timeout 45 detik (cold start Render) | 4 |
| 3 | `expectSuccess = false`: status 4xx/5xx dibaca sebagai data, bukan pengecualian | 4 |
| 4 | Heartbeat 10 menit ke `GET /periods`; percobaan ulang tiap 3 detik saat cold start; indikator koneksi hijau/kuning | 4, 6 |
| 5 | Buku Besar: status 404 dengan `hasPeriodSelected = false` diperlakukan sebagai "belum ada periode", bukan galat | 8 |
| 6 | Semua laporan membawa `hasPeriodSelected` dan `selectedPeriodName`; layar kosong bila periode belum dipilih | 6, 8, 9 |
| 7 | Periode tertutup (`isPeriodClosed`) mengunci edit dan hapus | 7, 8 |
| 8 | `journalType` hanya `General` / `Adjusting`; Closing dihitung, bukan disimpan | 7, 9 |
| 9 | Baris Neraca (`FinancialPositionLine.accountId`) selalu 0; jangan dipakai sebagai kunci | 9 |
| 10 | Format rupiah dan tanggal mengikuti `CurrencyFormatter`; tanggal tanpa pergeseran zona waktu | 3, 7 |
| 11 | Token JWT disimpan terenkripsi; "Ingat saya" memulihkan sesi saat Splash | 4, 5 |
| 12 | Tema selalu gelap; ikon status bar terang | 3 |

## 6. Kriteria Selesai Fase 1

| Kriteria | Status |
|---|---|
| 24 layar tercatat dengan endpoint dan fase target | Selesai |
| Seluruh endpoint dicocokkan dengan `/backend` | Selesai |
| Gap kontrak teridentifikasi | Selesai (T1) |
| Aturan perilaku lintas layar terdokumentasi | Selesai |
| Keputusan T1 dari pemilik `/backend` | **Menunggu** — wajib sebelum Fase 8 |
