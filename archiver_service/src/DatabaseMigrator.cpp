#include "DatabaseMigrator.hpp"
#include <chrono>
#include <iostream>
#include <thread>
#include <pqxx/pqxx>
#include "Str.hpp"

DatabaseMigrator::DatabaseMigrator(std::string db_conn_str)
    : connection_string(std::move(db_conn_str)) {}

void DatabaseMigrator::waitForSourceTable(const TableRef& source_table, int retry_seconds) {
    while (true) {
        try {
            pqxx::connection conn(connection_string);
            pqxx::work tx(conn);
            auto r = tx.exec(cat("SELECT to_regclass(", tx.quote(source_table.quoted()), ") IS NOT NULL;"));
            if (r[0][0].as<bool>()) {
                std::cout << cat("[Migrator] Tabel sumber ", source_table.quoted(), " siap.\n");
                return;
            }
            std::cout << cat("[Migrator] Tabel ", source_table.quoted(),
                             " belum ada (menunggu migrasi backend)...\n");
        } catch (const std::exception& e) {
            std::cerr << "[Migrator] Database belum siap: " << e.what() << "\n";
        }
        std::this_thread::sleep_for(std::chrono::seconds(retry_seconds));
    }
}

bool DatabaseMigrator::runMigrations(const TableRef& source_table, const TableRef& archive_table) {
    try {
        pqxx::connection conn(connection_string);
        pqxx::work tx(conn);

        std::cout << "[Migrator] Memeriksa/membuat schema arsip...\n";
        tx.exec(cat("CREATE SCHEMA IF NOT EXISTS ", TableRef::quoteIdent(archive_table.schema), ";"));

        std::cout << cat("[Migrator] Memeriksa/membuat tabel ", archive_table.quoted(), "...\n");
        tx.exec(cat("CREATE TABLE IF NOT EXISTS ", archive_table.quoted(),
                    " (LIKE ", source_table.quoted(), " INCLUDING ALL);"));

        // Sinkronkan kolom baru (jika backend menambah kolom setelah arsip dibuat).
        auto missing = tx.exec(cat(
            "SELECT a.attname, format_type(a.atttypid, a.atttypmod) "
            "FROM pg_attribute a "
            "WHERE a.attrelid = ", tx.quote(source_table.quoted()), "::regclass AND a.attnum > 0 AND NOT a.attisdropped "
            "AND NOT EXISTS (SELECT 1 FROM pg_attribute b WHERE b.attrelid = ", tx.quote(archive_table.quoted()),
            "::regclass AND b.attname = a.attname AND b.attnum > 0 AND NOT b.attisdropped);"));
        for (const auto& row : missing) {
            auto col = row[0].as<std::string>();
            auto type = row[1].as<std::string>();
            std::cout << cat("[Migrator] Menambah kolom arsip ", col, " (", type, ").\n");
            tx.exec(cat("ALTER TABLE ", archive_table.quoted(), " ADD COLUMN IF NOT EXISTS ",
                        TableRef::quoteIdent(col), " ", type, ";"));
        }

        tx.commit();
        std::cout << cat("[Migrator] Tabel ", archive_table.quoted(), " siap digunakan.\n");
        return true;
    } catch (const std::exception& e) {
        std::cerr << "[Migrator Error] Gagal migrasi: " << e.what() << "\n";
        return false;
    }
}
