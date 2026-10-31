-- Jalankan di Neon SQL Editor.
-- Tabel baru: Worksheet — snapshot kertas kerja (worksheet 10 kolom) per user dan periode.
-- Satu baris per akun ditambah satu baris total (IsTotalRow = true). Kolom mengikuti tabel di
-- web dan mobile: Neraca Saldo, Penyesuaian, Neraca Saldo Disesuaikan, Laba Rugi, Posisi Keuangan.
-- Isi tabel diganti utuh setiap kertas kerja periode tersebut dihitung ulang.

CREATE TABLE IF NOT EXISTS "Worksheet" (
    "Id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserId" uuid NOT NULL,
    "PeriodId" integer NOT NULL,
    "AccountId" integer NULL,
    "AccountNumber" character varying(50) NOT NULL,
    "AccountName" character varying(255) NOT NULL,
    "AccountType" character varying(50) NOT NULL,
    "NormalBalanceIsDebit" boolean NOT NULL DEFAULT false,
    "UnadjustedDebit" numeric(15,2) NOT NULL DEFAULT 0,
    "UnadjustedCredit" numeric(15,2) NOT NULL DEFAULT 0,
    "AdjustmentDebit" numeric(15,2) NOT NULL DEFAULT 0,
    "AdjustmentCredit" numeric(15,2) NOT NULL DEFAULT 0,
    "AdjustedDebit" numeric(15,2) NOT NULL DEFAULT 0,
    "AdjustedCredit" numeric(15,2) NOT NULL DEFAULT 0,
    "IncomeStatementDebit" numeric(15,2) NOT NULL DEFAULT 0,
    "IncomeStatementCredit" numeric(15,2) NOT NULL DEFAULT 0,
    "FinancialPositionDebit" numeric(15,2) NOT NULL DEFAULT 0,
    "FinancialPositionCredit" numeric(15,2) NOT NULL DEFAULT 0,
    "IsTotalRow" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "IX_Worksheet_UserId_PeriodId"
    ON "Worksheet" ("UserId", "PeriodId");
