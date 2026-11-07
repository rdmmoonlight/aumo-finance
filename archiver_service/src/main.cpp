// src/main.cpp
#include <iostream>
#include "ArchiverService.hpp"

int main(int argc, char* argv[]) {
    // String koneksi DB murni
    std::string db_conn = "dbname=mydb user=postgres password=secret host=127.0.0.1 port=5432";
    
    ArchiverService archiver(db_conn);

    // Contoh: Arsipkan tabel 'jurnal_transaksi' periode Oktober 2026
    int target_year = 2026;
    int target_month = 10;

    bool success = archiver.archiveMonthlyData(
        "jurnal_transaksi", 
        "jurnal_transaksi_archive", 
        target_year, 
        target_month
    );

    return success ? 0 : 1;
}
