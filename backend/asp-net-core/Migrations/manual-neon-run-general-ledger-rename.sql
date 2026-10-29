-- Jalankan di Neon SQL Editor.
-- Mengubah nama tabel General Ledger menjadi pola:
--   General Ledger (Permanent Accounts) -> "GeneralLedgerPermanentAccounts"
--   General Ledger (Temporary Accounts) -> "GeneralLedgerTemporaryAccounts"
-- Nama kolom diubah dari snake_case ke PascalCase (UserId, PeriodId, dst.).
-- Constraint (PK/FK), index, dan sequence ikut diganti namanya.
--
-- Skrip ini menangani semua kondisi awal:
--   a) tabel masih snake_case  : permanent_accounts_general_ledger
--   b) tabel PascalCase lama   : "PermanentAccountsGeneralLedger"
--   c) tabel sudah nama baru   : hanya kolom/constraint/index yang dirapikan
-- Data dan tipe kolom tidak berubah. Aman dijalankan berulang (idempotent).

BEGIN;

DO $$
DECLARE
    targets     TEXT[] := ARRAY['GeneralLedgerPermanentAccounts',
                                'GeneralLedgerTemporaryAccounts'];
    old_pascal  TEXT[] := ARRAY['PermanentAccountsGeneralLedger',
                                'TemporaryAccountsGeneralLedger'];
    old_snake   TEXT[] := ARRAY['permanent_accounts_general_ledger',
                                'temporary_accounts_general_ledger'];
    cols TEXT[] := ARRAY[
        ARRAY['id', 'Id'],
        ARRAY['user_id', 'UserId'],
        ARRAY['period_id', 'PeriodId'],
        ARRAY['account_id', 'AccountId'],
        ARRAY['journal_entry_id', 'JournalEntryId'],
        ARRAY['journal_entry_line_id', 'JournalEntryLineId'],
        ARRAY['entry_date', 'EntryDate'],
        ARRAY['transaction_number', 'TransactionNumber'],
        ARRAY['line_description', 'LineDescription'],
        ARRAY['debit', 'Debit'],
        ARRAY['credit', 'Credit'],
        ARRAY['running_balance', 'RunningBalance']
    ];
    i         INT;
    j         INT;
    new_t     TEXT;
    old_names TEXT[];
    src       TEXT;
    n         TEXT;
    sfx       TEXT;
    r         RECORD;
    new_name  TEXT;
BEGIN
    FOR i IN 1..array_length(targets, 1) LOOP
        new_t     := targets[i];
        old_names := ARRAY[old_pascal[i], old_snake[i]];

        -- 1. Tabel
        IF to_regclass(format('public.%I', new_t)) IS NULL THEN
            src := NULL;
            FOREACH n IN ARRAY old_names LOOP
                IF src IS NULL
                   AND to_regclass(format('public.%I', n)) IS NOT NULL THEN
                    src := n;
                END IF;
            END LOOP;

            IF src IS NULL THEN
                RAISE NOTICE 'Tabel % (dan nama lamanya) tidak ditemukan, dilewati.', new_t;
                CONTINUE;
            END IF;

            EXECUTE format('ALTER TABLE public.%I RENAME TO %I', src, new_t);
        END IF;

        -- 2. Sequence identity kolom id
        FOREACH n IN ARRAY old_names LOOP
            FOREACH sfx IN ARRAY ARRAY['_id_seq', '_Id_seq'] LOOP
                IF to_regclass(format('public.%I', n || sfx)) IS NOT NULL
                   AND to_regclass(format('public.%I', new_t || sfx)) IS NULL THEN
                    EXECUTE format('ALTER SEQUENCE public.%I RENAME TO %I',
                        n || sfx, new_t || sfx);
                END IF;
            END LOOP;
        END LOOP;

        -- 3. Kolom
        FOR j IN 1..array_length(cols, 1) LOOP
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = new_t
                  AND column_name = cols[j][1]
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = new_t
                  AND column_name = cols[j][2]
            ) THEN
                EXECUTE format('ALTER TABLE public.%I RENAME COLUMN %I TO %I',
                    new_t, cols[j][1], cols[j][2]);
            END IF;
        END LOOP;

        -- 4. Constraint (PK, FK) yang namanya memuat nama tabel/kolom lama
        FOR r IN
            SELECT c.conname
            FROM pg_constraint c
            WHERE c.conrelid = format('public.%I', new_t)::regclass
        LOOP
            new_name := r.conname;
            FOREACH n IN ARRAY old_names LOOP
                new_name := replace(new_name, n, new_t);
            END LOOP;
            FOR j IN 2..array_length(cols, 1) LOOP
                IF position('_' IN cols[j][1]) > 0 THEN
                    new_name := replace(new_name, cols[j][1], cols[j][2]);
                END IF;
            END LOOP;
            IF new_name <> r.conname THEN
                EXECUTE format('ALTER TABLE public.%I RENAME CONSTRAINT %I TO %I',
                    new_t, r.conname, new_name);
            END IF;
        END LOOP;

        -- 5. Index yang namanya memuat nama tabel/kolom lama
        FOR r IN
            SELECT indexname FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = new_t
        LOOP
            new_name := r.indexname;
            FOREACH n IN ARRAY old_names LOOP
                new_name := replace(new_name, n, new_t);
            END LOOP;
            FOR j IN 2..array_length(cols, 1) LOOP
                IF position('_' IN cols[j][1]) > 0 THEN
                    new_name := replace(new_name, cols[j][1], cols[j][2]);
                END IF;
            END LOOP;
            IF new_name <> r.indexname THEN
                EXECUTE format('ALTER INDEX public.%I RENAME TO %I',
                    r.indexname, new_name);
            END IF;
        END LOOP;
    END LOOP;
END $$;

COMMIT;

-- Verifikasi:
-- SELECT table_name, column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name LIKE 'GeneralLedger%Accounts'
-- ORDER BY table_name, ordinal_position;

-- ROLLBACK MANUAL (nama tabel saja, jika diperlukan):
-- ALTER TABLE "GeneralLedgerPermanentAccounts" RENAME TO "PermanentAccountsGeneralLedger";
-- ALTER TABLE "GeneralLedgerTemporaryAccounts" RENAME TO "TemporaryAccountsGeneralLedger";
