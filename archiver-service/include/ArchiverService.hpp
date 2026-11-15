#pragma once

#include <string>
#include "TableRef.hpp"

class ArchiverService {
private:
    std::string connection_string;

public:
    explicit ArchiverService(std::string db_conn_str);

    // Menyalin (TIDAK menghapus) baris jurnal milik periode yang sudah ditutup
    // (Periods.IsClosed = true) dari tabel sumber ke tabel arsip.
    // Periode sebuah baris ditentukan oleh EntryDate yang jatuh di antara
    // StartDate dan EndDate periode milik user yang sama (GeneralJournal tidak
    // punya kolom PeriodId). Aman dijalankan berulang (idempoten).
    bool archiveClosedPeriods(const TableRef& source_table,
                              const TableRef& archive_table,
                              const TableRef& periods_table);

    // Membersihkan tabel sumber setelah pengarsipan. Sebuah baris hanya dihapus bila:
    //   1. berada di periode yang sudah ditutup dan TIDAK terpilih (IsSelected = false),
    //   2. tidak berada di rentang periode terbuka/terpilih mana pun, dan
    //   3. salinan arsipnya ada dengan isi kolom yang identik (bukan sekadar Id yang sama).
    // Baris yang tidak memenuhi syarat 3 dibiarkan di tabel sumber dan dilaporkan di log.
    // Seluruh proses satu transaksi dan memakai advisory lock yang sama dengan backend
    // (PeriodsService.RestorePeriodRowsAsync) supaya tidak berbalapan dengan pemilihan periode.
    // Baris turunan General Ledger (FK ON DELETE CASCADE ke LineId) ikut terhapus; data itu
    // dihitung ulang oleh backend saat periodenya dipilih.
    bool purgeArchivedClosedPeriods(const TableRef& source_table,
                                    const TableRef& archive_table,
                                    const TableRef& periods_table);
};
