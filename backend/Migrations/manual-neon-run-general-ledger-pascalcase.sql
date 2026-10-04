-- Jalankan di Neon SQL Editor.
-- Mengubah nama tabel General Ledger dari snake_case ke PascalCase:
--   permanent_accounts_general_ledger -> "PermanentAccountsGeneralLedger"
--   temporary_accounts_general_ledger -> "TemporaryAccountsGeneralLedger"
-- Constraint (PK/FK), index, dan sequence ikut diganti namanya.
-- Nama kolom dan data tidak berubah. Aman dijalankan berulang (idempotent).

BEGIN;

DO $$
DECLARE
    pairs TEXT[] := ARRAY[
        ARRAY['permanent_accounts_general_ledger', 'PermanentAccountsGeneralLedger'],
        ARRAY['temporary_accounts_general_ledger', 'TemporaryAccountsGeneralLedger']
    ];
    i     INT;
    r     RECORD;
    old_t TEXT;
    new_t TEXT;
BEGIN
    FOR i IN 1..array_length(pairs, 1) LOOP
        old_t := pairs[i][1];
        new_t := pairs[i][2];

        IF to_regclass(format('public.%I', old_t)) IS NULL THEN
            RAISE NOTICE 'Tabel % tidak ditemukan, dilewati.', old_t;
            CONTINUE;
        END IF;

        IF to_regclass(format('public.%I', new_t)) IS NOT NULL THEN
            RAISE NOTICE 'Tabel % sudah ada, dilewati.', new_t;
            CONTINUE;
        END IF;

        -- 1. Tabel
        EXECUTE format('ALTER TABLE public.%I RENAME TO %I', old_t, new_t);

        -- 2. Constraint (PK, FK); index milik PK ikut berganti otomatis
        FOR r IN
            SELECT c.conname
            FROM pg_constraint c
            WHERE c.conrelid = format('public.%I', new_t)::regclass
              AND position(old_t IN c.conname) > 0
        LOOP
            EXECUTE format('ALTER TABLE public.%I RENAME CONSTRAINT %I TO %I',
                new_t, r.conname, replace(r.conname, old_t, new_t));
        END LOOP;

        -- 3. Index lainnya
        FOR r IN
            SELECT indexname
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename = new_t
              AND position(old_t IN indexname) > 0
        LOOP
            EXECUTE format('ALTER INDEX public.%I RENAME TO %I',
                r.indexname, replace(r.indexname, old_t, new_t));
        END LOOP;

        -- 4. Sequence identity kolom id
        IF to_regclass(format('public.%I', old_t || '_id_seq')) IS NOT NULL THEN
            EXECUTE format('ALTER SEQUENCE public.%I RENAME TO %I',
                old_t || '_id_seq', new_t || '_id_seq');
        END IF;
    END LOOP;
END $$;

COMMIT;

-- Verifikasi:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name ILIKE '%AccountsGeneralLedger';

-- ROLLBACK MANUAL (jika diperlukan):
-- ALTER TABLE "PermanentAccountsGeneralLedger" RENAME TO permanent_accounts_general_ledger;
-- ALTER TABLE "TemporaryAccountsGeneralLedger" RENAME TO temporary_accounts_general_ledger;
