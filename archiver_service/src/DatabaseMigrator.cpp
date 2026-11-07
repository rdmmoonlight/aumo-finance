#include "DatabaseMigrator.hpp"
#include <iostream>
#include <format>       // C++20
#include <pqxx/pqxx>

DatabaseMigrator::DatabaseMigrator(std::string db_conn_str)
    : connection_string(std::move(db_conn_str)) {}

bool DatabaseMigrator::runMigrations(const std::string& source_table, 
                                     const std::string& archive_table) {
    try {
        pqxx::connection conn(connection_string);
        if (!conn.is_open()) {
            std::cerr << "[Migrator] Gagal koneksi ke database.\n";
            return false;
        }

        pqxx::work tx(conn);

        // 1. Buat Schema 'archive' jika belum ada
        std::cout << "[Migrator] Memeriksa/Membuat schema 'archive'...\n";
        tx.exec("CREATE SCHEMA IF NOT EXISTS archive;");

        // 2. Buat Tabel Arsip berdasarkan struktur Tabel Utama (tanpa menyalin data)
        // Syntax INCLUDING ALL akan menyalin tipe data, indeks, dan constraint
        std::string create_table_query = std::format(
            "CREATE TABLE IF NOT EXISTS archive.{} (LIKE {} INCLUDING ALL);",
            archive_table, source_table
        );

        std::cout << std::format("[Migrator] Memeriksa/Membuat tabel 'archive.{}'...\n", archive_table);
        tx.exec(create_table_query);

        // Commit migrasi
        tx.commit();

        std::cout << "[Migrator] Migrasi schema & tabel arsip berhasil diselesaikan.\n";
        return true;

    } catch (const std::exception& e) {
        std::cerr << "[Migrator Error] Gagal menjalankan migrasi: " << e.what() << "\n";
        return false;
    }
}
