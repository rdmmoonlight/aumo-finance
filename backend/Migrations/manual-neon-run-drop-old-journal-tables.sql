-- Fase 5: hapus tabel lama "JournalEntryLines" dan "JournalEntries".
-- Jalankan di Neon SQL Editor SETELAH:
--   1) manual-neon-run-general-journal.sql        (tabel + backfill)
--   2) manual-neon-run-detach-journal-fk.sql      (lepas FK staging GL)
--   3) kode baru (Fase 1-4) ter-deploy dan diuji.
--
-- PERINGATAN: DROP TABLE tidak dapat dibatalkan. Buat Neon branch / backup
-- sebelum menjalankan.
--
-- Skrip ini memakai pengaman: seluruh proses DIBATALKAN (RAISE EXCEPTION,
-- tidak ada yang terhapus) jika salah satu syarat berikut tidak terpenuhi:
--   a) ada baris "JournalEntryLines" yang LineId-nya tidak ada di "GeneralJournal"
--   b) baris dengan LineId sama punya nilai berbeda (Debit, Kredit, Akun,
--      JournalEntryId, TransactionNumber, EntryDate, UserId)
--   c) masih ada FK dari tabel lain ke tabel lama
--   d) masih ada view yang bergantung pada tabel lama
--
-- Catatan (a): setelah kode baru dipakai, mengedit atau menghapus jurnal LAMA
-- menghapus baris di "GeneralJournal" (edit membuat LineId baru), sehingga
-- baris tabel lama tampak "hilang". Itu wajar. Jika Anda sudah memastikan
-- selisihnya hanya karena edit/hapus pasca-deploy, ubah allow_missing
-- di bawah menjadi true. Selama belum ada aktivitas jurnal pasca-deploy,
-- biarkan false.

BEGIN;

DO $$
DECLARE
    old_lines   bigint;
    missing     bigint;
    diff_amount bigint;
    fk_count    bigint;
    view_count  bigint;
    allow_missing boolean := false;  -- ubah ke true hanya setelah selisih (a) dipastikan wajar
BEGIN
    IF to_regclass('"JournalEntryLines"') IS NULL OR to_regclass('"JournalEntries"') IS NULL THEN
        RAISE NOTICE 'Tabel lama sudah tidak ada -> tidak ada yang dihapus.';
        RETURN;
    END IF;

    -- (a) setiap baris lama harus ada di GeneralJournal
    SELECT COUNT(*) INTO old_lines FROM "JournalEntryLines";
    SELECT COUNT(*) INTO missing
    FROM "JournalEntryLines" l
    WHERE NOT EXISTS (SELECT 1 FROM "GeneralJournal" g WHERE g."LineId" = l."Id");
    IF missing > 0 THEN
        IF allow_missing THEN
            RAISE NOTICE '% dari % baris lama tidak ada di GeneralJournal (diizinkan: allow_missing = true).', missing, old_lines;
        ELSE
            RAISE EXCEPTION 'BATAL: % dari % baris di JournalEntryLines belum ada di GeneralJournal. Jika karena backfill belum lengkap, jalankan ulang manual-neon-run-general-journal.sql. Jika karena edit/hapus jurnal pasca-deploy, set allow_missing = true.', missing, old_lines;
        END IF;
    END IF;

    -- (b) nilai Debit/Kredit/Akun/Header pada baris yang sama harus identik
    SELECT COUNT(*) INTO diff_amount
    FROM "JournalEntryLines" l
    JOIN "JournalEntries" e ON e."Id" = l."JournalEntryId"
    JOIN "GeneralJournal" g ON g."LineId" = l."Id"
    WHERE g."Debit" <> l."Debit"
       OR g."Credit" <> l."Credit"
       OR g."AccountId" <> l."AccountId"
       OR g."JournalEntryId" <> e."Id"
       OR g."TransactionNumber" <> e."TransactionNumber"
       OR g."EntryDate" <> e."EntryDate"
       OR g."UserId" <> e."UserId";
    IF diff_amount > 0 THEN
        RAISE EXCEPTION 'BATAL: % baris berbeda nilainya antara JournalEntryLines dan GeneralJournal.', diff_amount;
    END IF;

    -- (c) FK dari tabel lain ke tabel lama (selain FK internal JournalEntryLines -> JournalEntries)
    SELECT COUNT(*) INTO fk_count
    FROM pg_constraint
    WHERE contype = 'f'
      AND confrelid IN ('"JournalEntries"'::regclass, '"JournalEntryLines"'::regclass)
      AND NOT (conrelid = '"JournalEntryLines"'::regclass AND confrelid = '"JournalEntries"'::regclass);
    IF fk_count > 0 THEN
        RAISE EXCEPTION 'BATAL: masih ada % FK dari tabel lain ke tabel jurnal lama. Jalankan manual-neon-run-detach-journal-fk.sql.', fk_count;
    END IF;

    -- (d) view yang bergantung pada tabel lama
    SELECT COUNT(DISTINCT v.oid) INTO view_count
    FROM pg_depend d
    JOIN pg_rewrite r ON r.oid = d.objid
    JOIN pg_class v ON v.oid = r.ev_class
    JOIN pg_class src ON src.oid = d.refobjid
    WHERE src.relname IN ('JournalEntries','JournalEntryLines')
      AND v.oid <> src.oid;
    IF view_count > 0 THEN
        RAISE EXCEPTION 'BATAL: masih ada % view yang bergantung pada tabel jurnal lama.', view_count;
    END IF;

    RAISE NOTICE 'Semua pengecekan lolos (% baris lama terverifikasi). Menghapus tabel lama.', old_lines;

    DROP TABLE "JournalEntryLines";
    DROP TABLE "JournalEntries";
END $$;

COMMIT;

-- Verifikasi (jalankan terpisah):
-- SELECT to_regclass('"JournalEntries"') AS je, to_regclass('"JournalEntryLines"') AS jel;  -- keduanya NULL
-- SELECT COUNT(*) FROM "GeneralJournal";
