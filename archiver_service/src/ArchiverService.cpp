// src/ArchiverService.cpp
#include "ArchiverService.hpp"
#include <iostream>
#include <chrono>
#include <format> // C++20 std::format

ArchiverService::ArchiverService(std::string db_conn_str) 
    : connection_string(std::move(db_conn_str)) {}

bool ArchiverService::archiveMonthlyData(const std::string& source_table, 
                                         const std::string& target_table, 
                                         int year, 
                                         int month) {
    try {
        pqxx::connection conn(connection_string);
        if (!conn.is_open()) {
            std::cerr << "Gagal terkoneksi ke database.\n";
            return false;
        }

        // 1. Hitung awal bulan & awal bulan berikutnya menggunakan std::format (C++20)
        std::string start_date = std::format("{:04d}-{:02d}-01", year, month);
        
        int next_year = (month == 12) ? year + 1 : year;
        int next_month = (month == 12) ? 1 : month + 1;
        std::string end_date = std::format("{:04d}-{:02d}-01", next_year, next_month);

        std::cout << std::format("Proses Arsip: {} -> [{}] s/d [{}]\n", source_table, start_date, end_date);

        // 2. Transaksi Manual (ACID)
        pqxx::work tx(conn);

        // Salin data periode tersebut ke tabel arsip
        std::string query_copy = std::format(
            "INSERT INTO {} SELECT * FROM {} WHERE created_at >= {} AND created_at < {};",
            target_table, source_table, tx.quote(start_date), tx.quote(end_date)
        );
        pqxx::result res_copy = tx.exec(query_copy);

        // Hapus data yang sudah dipindah dari tabel utama
        std::string query_delete = std::format(
            "DELETE FROM {} WHERE created_at >= {} AND created_at < {};",
            source_table, tx.quote(start_date), tx.quote(end_date)
        );
        tx.exec(query_delete);

        // Commit jika semua aman
        tx.commit();

        std::cout << std::format("Selesai. {} baris data berhasil diarsip.\n", res_copy.affected_rows());
        return true;

    } catch (const std::exception& e) {
        std::cerr << "Error Executing Archiver: " << e.what() << "\n";
        return false;
    }
}
