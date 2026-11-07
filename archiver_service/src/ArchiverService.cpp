#include "ArchiverService.hpp"
#include <iostream>
#include <format>
#include <pqxx/pqxx>

ArchiverService::ArchiverService(std::string db_conn_str) 
    : connection_string(std::move(db_conn_str)) {}

bool ArchiverService::archiveMonthlyData(const std::string& source_table, 
                                         const std::string& target_table, 
                                         int year, 
                                         int month) {
    try {
        pqxx::connection conn(connection_string);
        if (!conn.is_open()) {
            std::cerr << "[Archiver] Gagal membuka koneksi ke database.\n";
            return false;
        }

        // Format tanggal batas periode (Awal bulan s/d awal bulan berikutnya)
        std::string start_date = std::format("{:04d}-{:02d}-01", year, month);
        
        int next_year = (month == 12) ? year + 1 : year;
        int next_month = (month == 12) ? 1 : month + 1;
        std::string end_date = std::format("{:04d}-{:02d}-01", next_year, next_month);

        std::cout << std::format("[Archiver] Memindahkan data {} -> {} (Periode: {} s/d {})\n", 
                                 source_table, target_table, start_date, end_date);

        pqxx::work tx(conn);

        // 1. Salin data berdasar kolom CreatedAt ke schema archive
        std::string copy_query = std::format(
            "INSERT INTO {} SELECT * FROM {} WHERE \"CreatedAt\" >= $1 AND \"CreatedAt\" < $2;",
            target_table, source_table
        );
        pqxx::result res_copy = tx.exec_params(copy_query, start_date, end_date);
        long long rows_archived = res_copy.affected_rows();

        // 2. Hapus data yang sudah dipindah dari tabel utama
        std::string delete_query = std::format(
            "DELETE FROM {} WHERE \"CreatedAt\" >= $1 AND \"CreatedAt\" < $2;",
            source_table
        );
        tx.exec_params(delete_query, start_date, end_date);

        // Commit transaksi (ACID)
        tx.commit();

        std::cout << std::format("[Archiver] Selesai. Total {} baris data GeneralJournal berhasil dipindah ke schema archive.\n", rows_archived);
        return true;

    } catch (const std::exception& e) {
        std::cerr << "[Archiver Error] Gagal mengarsip data: " << e.what() << "\n";
        return false;
    }
}
