#include "ArchiverService.hpp"
#include <iostream>
#include "Str.hpp"
#include <string>
#include <pqxx/pqxx>

ArchiverService::ArchiverService(std::string db_conn_str)
    : connection_string(std::move(db_conn_str)) {}

bool ArchiverService::archiveClosedPeriods(const TableRef& source_table,
                                           const TableRef& archive_table,
                                           const TableRef& periods_table) {
    try {
        pqxx::connection conn(connection_string);
        pqxx::work tx(conn);

        // Kolom yang dimiliki sumber DAN arsip, urut mengikuti sumber.
        // Daftar kolom eksplisit menghindari salah-urut akibat SELECT *.
        auto cols = tx.exec(cat(
            "SELECT a.attname FROM pg_attribute a "
            "WHERE a.attrelid = ", tx.quote(source_table.quoted()), "::regclass AND a.attnum > 0 AND NOT a.attisdropped "
            "AND EXISTS (SELECT 1 FROM pg_attribute b WHERE b.attrelid = ", tx.quote(archive_table.quoted()),
            "::regclass AND b.attname = a.attname AND b.attnum > 0 AND NOT b.attisdropped) "
            "ORDER BY a.attnum;"));

        std::string col_list, select_list;
        for (const auto& row : cols) {
            auto q = TableRef::quoteIdent(row[0].as<std::string>());
            if (!col_list.empty()) { col_list += ", "; select_list += ", "; }
            col_list += q;
            select_list += "g." + q;
        }
        if (col_list.empty()) {
            std::cerr << "[Archiver] Tidak ada kolom yang cocok antara sumber dan arsip.\n";
            return false;
        }

        // Salin baris milik periode tertutup. TIDAK ada DELETE: data asli tetap di
        // tabel sumber agar laporan yang membacanya tidak berubah.
        // ON CONFLICT DO NOTHING membuat proses idempoten (baris yang sudah
        // terarsip dilewati, tidak diduplikasi).
        auto copy_query = cat(
            "INSERT INTO ", archive_table.quoted(), " (", col_list, ") "
            "SELECT ", select_list, " FROM ", source_table.quoted(), " g "
            "WHERE EXISTS (SELECT 1 FROM ", periods_table.quoted(), " p "
            "  WHERE p.\"IsClosed\" = TRUE AND p.\"UserId\" = g.\"UserId\" "
            "  AND g.\"EntryDate\" >= p.\"StartDate\" "
            "  AND g.\"EntryDate\" < (p.\"EndDate\"::date + 1)) "
            "ON CONFLICT DO NOTHING;");

        auto res = tx.exec(copy_query);
        auto rows_archived = res.affected_rows();
        tx.commit();

        std::cout << cat("[Archiver] Selesai. ", rows_archived, " baris baru disalin ke ",
                         archive_table.quoted(), " (data sumber tidak dihapus).\n");
        return true;
    } catch (const std::exception& e) {
        std::cerr << "[Archiver Error] Gagal mengarsip data: " << e.what() << "\n";
        return false;
    }
}
