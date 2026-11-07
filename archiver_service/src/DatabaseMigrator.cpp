#include "DatabaseMigrator.hpp"
#include <iostream>
#include <format>
#include <pqxx/pqxx>

DatabaseMigrator::DatabaseMigrator(std::string db_conn_str)
    : connection_string(std::move(db_conn_str)) {}

bool DatabaseMigrator::runMigrations(const std::string& source_table, 
                                     const std::string& archive_table_name) {
    try {
        pqxx::connection conn(connection_string);
        if (!conn.is_open()) {
            std::cerr << "[Migrator] Gagal membuka koneksi ke database.\n";
            return false;
        }

        pqxx::work tx(conn);

        // 1. Buat Schema 'archive' jika belum ada
        std::cout << "[Migrator] Memeriksa/Membuat schema 'archive'...\n";
        tx.exec("CREATE SCHEMA IF NOT EXISTS archive;");

        // 2. Buat Tabel 'archive.general_journals' berdasarkan struktur 'public.general_journals'
        std::string create_table_query = std::format(
            "CREATE TABLE IF NOT EXISTS archive.{} (LIKE {} INCLUDING ALL);",
            archive_table_name, source_table
        );

        std::cout << std::format("[Migrator] Memeriksa/Membuat tabel 'archive.{}'...\n", archive_table_name);
        tx.exec(create_table_query);

        tx.commit();
        std::cout << "[Migrator] Schema & tabel 'archive." << archive_table_name << "' siap digunakan.\n";
        return true;

    } catch (const std::exception& e) {
        std::cerr << "[Migrator Error] Gagal migrasi: " << e.what() << "\n";
        return false;
    }
}
