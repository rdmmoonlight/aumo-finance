#pragma once

#include <string>

class DatabaseMigrator {
private:
    std::string connection_string;

public:
    explicit DatabaseMigrator(std::string db_conn_str);

    // Menjalankan inisialisasi schema & tabel arsip
    bool runMigrations(const std::string& source_table, 
                       const std::string& archive_table);
};
