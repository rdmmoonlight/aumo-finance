-- Fase 4: lepaskan relasi (FK) ke tabel lama "JournalEntries" dan
-- "JournalEntryLines". Jalankan di Neon SQL Editor SETELAH
-- manual-neon-run-general-journal.sql dan SEBELUM menghapus tabel lama
-- (manual-neon-run-drop-old-journal-tables.sql).
--
-- Perubahan:
--   * Tabel staging "GeneralLedgerPermanentAccounts" dan
--     "GeneralLedgerTemporaryAccounts":
--       - FK ke "JournalEntries"      -> dihapus (tidak ada tabel header lagi;
--                                        "JournalEntryId" menjadi kolom biasa)
--       - FK ke "JournalEntryLines"   -> diganti FK ke "GeneralJournal"("LineId")
--                                        dengan ON DELETE CASCADE (perilaku sama
--                                        seperti sebelumnya)
--   * Baris staging yang "JournalEntryLineId"-nya tidak ada di
--     "GeneralJournal" dihapus. Staging hanya cache hasil turunan; sistem
--     membangun ulang otomatis saat jumlah baris tidak sinkron.
--
-- Aman dijalankan berulang (idempotent).

BEGIN;

DO $$
DECLARE
    t   text;
    c   record;
    fk  text;
BEGIN
    FOREACH t IN ARRAY ARRAY['GeneralLedgerPermanentAccounts','GeneralLedgerTemporaryAccounts']
    LOOP
        IF to_regclass(format('%I', t)) IS NULL THEN
            RAISE NOTICE 'Tabel % tidak ditemukan -> dilewati.', t;
            CONTINUE;
        END IF;

        -- 1) Hapus semua FK dari tabel staging ke tabel jurnal lama (nama FK dicari otomatis).
        FOR c IN
            SELECT con.conname
            FROM pg_constraint con
            WHERE con.contype = 'f'
              AND con.conrelid = format('%I', t)::regclass
              AND con.confrelid IN (
                    SELECT oid FROM pg_class
                    WHERE relname IN ('JournalEntries','JournalEntryLines')
                      AND relnamespace = current_schema()::regnamespace)
        LOOP
            RAISE NOTICE 'DROP FK % pada %', c.conname, t;
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', t, c.conname);
        END LOOP;

        -- 2) Bersihkan baris staging yatim (cache turunan, dibangun ulang otomatis).
        EXECUTE format(
            'DELETE FROM %I s WHERE NOT EXISTS (SELECT 1 FROM "GeneralJournal" g WHERE g."LineId" = s."JournalEntryLineId")',
            t);

        -- 3) FK baru ke GeneralJournal("LineId").
        -- Nama FK dibuat pendek: batas identifier PostgreSQL 63 karakter.
        fk := CASE t
                WHEN 'GeneralLedgerPermanentAccounts' THEN 'FK_GLPermanent_GeneralJournal_LineId'
                ELSE 'FK_GLTemporary_GeneralJournal_LineId'
              END;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = fk) THEN
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY ("JournalEntryLineId") REFERENCES "GeneralJournal" ("LineId") ON DELETE CASCADE',
                t, fk);
        END IF;

        -- 4) Index untuk FK (cascade delete dan join).
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I ("JournalEntryLineId")',
                       'IX_' || t || '_JournalEntryLineId', t);
    END LOOP;
END $$;

COMMIT;

-- ============================================================
-- VERIFIKASI (jalankan terpisah setelah COMMIT)
-- ============================================================

-- A) FK yang masih mengarah ke tabel lama. Hasil yang benar: hanya
--    FK internal "JournalEntryLines" -> "JournalEntries" (atau kosong).
-- SELECT conrelid::regclass AS dari_tabel, conname, confrelid::regclass AS ke_tabel
-- FROM pg_constraint
-- WHERE contype = 'f'
--   AND confrelid IN ('"JournalEntries"'::regclass, '"JournalEntryLines"'::regclass);

-- B) View / fungsi / trigger yang masih memakai tabel lama (harus kosong sebelum DROP):
-- SELECT DISTINCT dependent_view.relname AS view_bergantung
-- FROM pg_depend d
-- JOIN pg_rewrite r ON r.oid = d.objid
-- JOIN pg_class dependent_view ON dependent_view.oid = r.ev_class
-- JOIN pg_class src ON src.oid = d.refobjid
-- WHERE src.relname IN ('JournalEntries','JournalEntryLines')
--   AND dependent_view.oid <> src.oid;
