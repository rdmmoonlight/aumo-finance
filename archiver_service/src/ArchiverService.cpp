#include "ArchiverService.hpp"
#include <iostream>
#include <format>       // C++20 std::format
#include <pqxx/pqxx>    // Dynamic DB driver libpqxx

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

        // 1. Format rentang tanggal (Awal bulan s/d awal bulan berikutnya)
        std::string start_date = std::format("{:04d}-{:02d}-01", year, month);
        
        int next_year = (month == 12) ? year + 1 : year;
        int next_month = (month == 12) ? 1 : month + 1;
        std::string end_date = std::format("{:04d}-{:02d}-01", next_year, next_month);

        std::cout << std::format("Memulai pengarsipan [{}] -> [{}] Periode: {} s/d {}\n", 
                                 source_table, target_table, start_date, end_date);

        // 2. Gunakan transaksi ACID
        pqxx::work tx(conn);

        // 3. Salin data menggunakan Parameterized Query (Bebas dari tx.quote())
        std::string copy_query = std::format(
            "INSERT INTO {} SELECT * FROM {} WHERE created_at >= $1 AND created_at < $2;",
            target_table, source_table
        );
        pqxx::result res_copy = tx.exec_params(copy_query, start_date, end_date);

        // 4. Hapus data yang sudah berhasil disalin dari tabel utama
        std::string delete_query = std::format(
            "DELETE FROM {} WHERE created_at >= $1 AND created_at < $2;",
            source_table
        );
        tx.exec_params(delete_query, start_date, end_date);

        // Commit transaksi jika seluruh query sukses
        tx.commit();

        std::cout << std::format("Selesai. Total {} baris data berhasil diarsip.\n", res_copy.affected_rows());
        return true;

    } catch (const std::exception& e) {
        std::cerr << "Error saat proses pengarsipan: " << e.what() << "\n";
        return false;
    }
}
