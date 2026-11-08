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
};
