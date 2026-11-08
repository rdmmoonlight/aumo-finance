#pragma once

#include <string>
#include "TableRef.hpp"

class DatabaseMigrator {
private:
    std::string connection_string;

public:
    explicit DatabaseMigrator(std::string db_conn_str);

    // Menunggu sampai database bisa dihubungi dan tabel sumber sudah ada
    // (dibuat oleh migrasi EF Core milik backend .NET). Mencoba ulang tanpa
    // henti, sehingga service ini tidak pernah crash-loop saat startup.
    void waitForSourceTable(const TableRef& source_table, int retry_seconds);

    // Membuat schema & tabel arsip (struktur identik dengan tabel sumber) dan
    // menambahkan kolom baru di arsip bila tabel sumber bertambah kolom.
    bool runMigrations(const TableRef& source_table, const TableRef& archive_table);
};
