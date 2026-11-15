#include "ArchiverService.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <pqxx/pqxx>
#include "Str.hpp"

namespace {

// Kunci yang sama dengan backend .NET (PeriodsService.RestorePeriodRowsAsync).
// Menjamin purge dan pemulihan data tidak berjalan bersamaan.
constexpr const char* kSyncLockQuery =
    "SELECT pg_advisory_xact_lock(hashtext('aumo_generaljournal_sync'));";

// Kolom yang dimiliki sumber DAN arsip, urut mengikuti sumber.
// Daftar kolom eksplisit menghindari salah-urut akibat SELECT *.
std::vector<std::string> commonColumns(pqxx::work& tx,
                                       const TableRef& source_table,
                                       const TableRef& archive_table) {
    auto cols = tx.exec(cat(
        "SELECT a.attname FROM pg_attribute a "
        "WHERE a.attrelid = ", tx.quote(source_table.quoted()), "::regclass AND a.attnum > 0 AND NOT a.attisdropped "
        "AND EXISTS (SELECT 1 FROM pg_attribute b WHERE b.attrelid = ", tx.quote(archive_table.quoted()),
        "::regclass AND b.attname = a.attname AND b.attnum > 0 AND NOT b.attisdropped) "
        "ORDER BY a.attnum;"));
    std::vector<std::string> out;
    for (const auto& row : cols) out.push_back(row[0].as<std::string>());
    return out;
}

// Baris g berada di rentang tanggal periode (alias) milik user yang sama.
std::string inRange(const std::string& alias) {
    return cat(alias, ".\"UserId\" = g.\"UserId\" AND g.\"EntryDate\" >= ", alias, ".\"StartDate\" "
               "AND g.\"EntryDate\" < (", alias, ".\"EndDate\"::date + 1)");
}

} // namespace

ArchiverService::ArchiverService(std::string db_conn_str)
    : connection_string(std::move(db_conn_str)) {}

bool ArchiverService::archiveClosedPeriods(const TableRef& source_table,
                                           const TableRef& archive_table,
                                           const TableRef& periods_table) {
    try {
        pqxx::connection conn(connection_string);
        pqxx::work tx(conn);

        std::string col_list, select_list;
        for (const auto& name : commonColumns(tx, source_table, archive_table)) {
            auto q = TableRef::quoteIdent(name);
            if (!col_list.empty()) { col_list += ", "; select_list += ", "; }
            col_list += q;
            select_list += "g." + q;
        }
        if (col_list.empty()) {
            std::cerr << "[Archiver] Tidak ada kolom yang cocok antara sumber dan arsip.\n";
            return false;
        }

        // Salin baris milik periode tertutup. Tidak ada DELETE di sini; penghapusan
        // dilakukan terpisah oleh purgeArchivedClosedPeriods().
        // ON CONFLICT DO NOTHING membuat proses idempoten (baris yang sudah
        // terarsip dilewati, tidak diduplikasi).
        auto copy_query = cat(
            "INSERT INTO ", archive_table.quoted(), " (", col_list, ") "
            "SELECT ", select_list, " FROM ", source_table.quoted(), " g "
            "WHERE EXISTS (SELECT 1 FROM ", periods_table.quoted(), " p "
            "  WHERE p.\"IsClosed\" = TRUE AND ", inRange("p"), ") "
            "ON CONFLICT DO NOTHING;");

        auto res = tx.exec(copy_query);
        auto rows_archived = res.affected_rows();
        tx.commit();

        std::cout << cat("[Archiver] Selesai. ", rows_archived, " baris baru disalin ke ",
                         archive_table.quoted(), ".\n");
        return true;
    } catch (const std::exception& e) {
        std::cerr << "[Archiver Error] Gagal mengarsip data: " << e.what() << "\n";
        return false;
    }
}

bool ArchiverService::purgeArchivedClosedPeriods(const TableRef& source_table,
                                                 const TableRef& archive_table,
                                                 const TableRef& periods_table) {
    try {
        pqxx::connection conn(connection_string);
        pqxx::work tx(conn);

        // Lock dulu, baru evaluasi Periods: status IsSelected dibaca SETELAH lock didapat.
        tx.exec(kSyncLockQuery);

        std::string same;
        for (const auto& name : commonColumns(tx, source_table, archive_table)) {
            auto q = TableRef::quoteIdent(name);
            same += cat(" AND a.", q, " IS NOT DISTINCT FROM g.", q);
        }
        if (same.empty()) {
            std::cerr << "[Archiver] Purge dibatalkan: tidak ada kolom yang cocok antara sumber dan arsip.\n";
            return false;
        }

        // Baris layak-purge: periode tertutup & tidak terpilih, dan tidak tumpang tindih
        // dengan periode terbuka/terpilih mana pun.
        const std::string eligible = cat(
            "EXISTS (SELECT 1 FROM ", periods_table.quoted(), " p "
            "  WHERE p.\"IsClosed\" = TRUE AND p.\"IsSelected\" = FALSE AND ", inRange("p"), ") "
            "AND NOT EXISTS (SELECT 1 FROM ", periods_table.quoted(), " k "
            "  WHERE (k.\"IsClosed\" = FALSE OR k.\"IsSelected\" = TRUE) AND ", inRange("k"), ")");

        auto del = tx.exec(cat(
            "DELETE FROM ", source_table.quoted(), " g WHERE ", eligible,
            " AND EXISTS (SELECT 1 FROM ", archive_table.quoted(),
            " a WHERE a.\"LineId\" = g.\"LineId\"", same, ");"));
        auto rows_deleted = del.affected_rows();

        // Baris layak-purge yang tersisa = salinan arsipnya belum ada atau berbeda isi.
        auto left = tx.exec1(cat(
            "SELECT count(*) FROM ", source_table.quoted(), " g WHERE ", eligible, ";"));
        auto rows_skipped = left[0].as<long long>();

        tx.commit();

        std::cout << cat("[Archiver] Purge selesai. ", rows_deleted, " baris dihapus dari ",
                         source_table.quoted(), ", ", rows_skipped,
                         " baris dibiarkan (arsip belum ada/berbeda isi).\n");
        return true;
    } catch (const std::exception& e) {
        std::cerr << "[Archiver Error] Gagal membersihkan tabel sumber: " << e.what() << "\n";
        return false;
    }
}
