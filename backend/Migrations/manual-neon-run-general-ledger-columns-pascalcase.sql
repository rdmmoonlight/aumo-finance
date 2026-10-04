-- Jalankan di Neon SQL Editor (SETELAH manual-neon-run-general-ledger-pascalcase.sql).
-- Mengubah nama kolom tabel "PermanentAccountsGeneralLedger" dan
-- "TemporaryAccountsGeneralLedger" dari snake_case ke PascalCase,
-- sama seperti tabel lain (mis. "Periods", "JournalEntries").
-- Nama constraint dan index yang memuat nama kolom lama ikut diganti.
-- Data dan tipe kolom tidak berubah. Aman dijalankan berulang (idempotent).

BEGIN;

DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'PermanentAccountsGeneralLedger', 'permanent_accounts_general_ledger',
        'TemporaryAccountsGeneralLedger', 'temporary_accounts_general_ledger'
    ];
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
    i INT;
    j INT;
    t TEXT;
    r RECORD;
    new_name TEXT;
BEGIN
    FOR i IN 1..array_length(tables, 1) BY 2 LOOP
        -- Pakai nama PascalCase jika sudah ada, jika belum pakai nama lama
        IF to_regclass(format('public.%I', tables[i])) IS NOT NULL THEN
            t := tables[i];
        ELSIF to_regclass(format('public.%I', tables[i + 1])) IS NOT NULL THEN
            t := tables[i + 1];
        ELSE
            RAISE NOTICE 'Tabel % tidak ditemukan, dilewati.', tables[i];
            CONTINUE;
        END IF;

        -- 1. Kolom
        FOR j IN 1..array_length(cols, 1) LOOP
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = t
                  AND column_name = cols[j][1]
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = t
                  AND column_name = cols[j][2]
            ) THEN
                EXECUTE format('ALTER TABLE public.%I RENAME COLUMN %I TO %I',
                    t, cols[j][1], cols[j][2]);
            END IF;
        END LOOP;

        -- 2. Constraint (FK dll.) yang namanya memuat nama kolom lama
        FOR r IN
            SELECT c.conname
            FROM pg_constraint c
            WHERE c.conrelid = format('public.%I', t)::regclass
        LOOP
            new_name := r.conname;
            FOR j IN 2..array_length(cols, 1) LOOP
                IF cols[j][1] LIKE '%\_%' THEN
                    new_name := replace(new_name, cols[j][1], cols[j][2]);
                END IF;
            END LOOP;
            IF new_name <> r.conname THEN
                EXECUTE format('ALTER TABLE public.%I RENAME CONSTRAINT %I TO %I',
                    t, r.conname, new_name);
            END IF;
        END LOOP;

        -- 3. Index yang namanya memuat nama kolom lama
        FOR r IN
            SELECT indexname FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = t
        LOOP
            new_name := r.indexname;
            FOR j IN 2..array_length(cols, 1) LOOP
                IF cols[j][1] LIKE '%\_%' THEN
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
-- WHERE table_schema = 'public' AND table_name ILIKE '%AccountsGeneralLedger'
-- ORDER BY table_name, ordinal_position;
