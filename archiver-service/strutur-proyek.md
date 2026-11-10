```
archiver-service/
├── include/
│   ├── Str.hpp               # Helper cat(...) pengganti std::format (build C++17)
│   ├── TableRef.hpp          # Rujukan tabel schema.nama + quoting identifier aman
│   ├── DatabaseMigrator.hpp  # Tunggu tabel sumber, buat schema/tabel arsip, sinkron kolom
│   └── ArchiverService.hpp   # Salin baris jurnal periode tertutup ke arsip
└── src/
    ├── main.cpp              # Entry point: resolusi koneksi, loop berkala
    ├── DatabaseMigrator.cpp
    └── ArchiverService.cpp
```

Aturan sistem arsip:

- Sumber: public."GeneralJournal"; tujuan: archive."GeneralJournal".
- Baris diarsipkan bila EntryDate jatuh dalam rentang periode milik user yang sama
  dengan public."Periods"."IsClosed" = true (GeneralJournal tidak punya PeriodId).
- Hanya menyalin (INSERT ... ON CONFLICT DO NOTHING). Data sumber TIDAK dihapus.
- Idempoten; dijalankan saat start lalu tiap ARCHIVE_INTERVAL_MINUTES (default 360).
- Koneksi: DATABASE_URL, atau ConnectionStrings__DefaultConnection (format Npgsql
  dikonversi otomatis ke libpq).
