#include <algorithm>
#include <cctype>
#include <chrono>
#include <cstdlib>
#include <initializer_list>
#include <iostream>
#include <map>
#include <string>
#include <thread>
#include "ArchiverService.hpp"
#include "DatabaseMigrator.hpp"
#include "TableRef.hpp"
#include "Str.hpp"

namespace {

std::string lower(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) { return std::tolower(c); });
    return s;
}

// Mengubah connection string gaya Npgsql ("Host=..;Database=..;Username=..;Password=..")
// menjadi format libpq ("host=.. dbname=.. user=.. password=..").
std::string npgsqlToLibpq(const std::string& npgsql) {
    std::map<std::string, std::string> kv;
    size_t pos = 0;
    while (pos < npgsql.size()) {
        size_t end = npgsql.find(';', pos);
        if (end == std::string::npos) end = npgsql.size();
        std::string part = npgsql.substr(pos, end - pos);
        size_t eq = part.find('=');
        if (eq != std::string::npos) {
            std::string key = lower(part.substr(0, eq));
            key.erase(std::remove(key.begin(), key.end(), ' '), key.end());
            kv[key] = part.substr(eq + 1);
        }
        pos = end + 1;
    }
    auto get = [&](std::initializer_list<const char*> names) -> std::string {
        for (auto n : names) if (kv.count(n)) return kv[n];
        return "";
    };
    std::string out;
    auto add = [&](const char* k, const std::string& v) {
        if (v.empty()) return;
        std::string esc;
        for (char c : v) { if (c == '\\' || c == '\'') esc += '\\'; esc += c; }
        out += cat(k, "='", esc, "' ");
    };
    add("host", get({"host", "server"}));
    add("port", get({"port"}));
    add("dbname", get({"database", "dbname"}));
    add("user", get({"username", "userid", "uid", "user"}));
    add("password", get({"password", "pwd"}));
    std::string ssl = lower(get({"sslmode"}));
    if (ssl == "require" || ssl == "verifyfull" || ssl == "verifyca") out += "sslmode=require ";
    else if (ssl == "disable") out += "sslmode=disable ";
    return out;
}

// Prioritas: DATABASE_URL (format libpq/URI) -> ConnectionStrings__DefaultConnection
// (env yang sama dengan backend .NET) -> default lokal.
std::string resolveConnectionString() {
    if (const char* url = std::getenv("DATABASE_URL"); url && *url) return url;
    if (const char* dn = std::getenv("ConnectionStrings__DefaultConnection"); dn && *dn) {
        std::string v = dn;
        if (v.rfind("postgres://", 0) == 0 || v.rfind("postgresql://", 0) == 0) return v;
        return npgsqlToLibpq(v);
    }
    return "host=localhost port=5432 dbname=aumo_db user=postgres password=secret";
}

int envInt(const char* name, int fallback) {
    if (const char* v = std::getenv(name); v && *v) {
        try { return std::max(1, std::stoi(v)); } catch (...) {}
    }
    return fallback;
}

} // namespace

int main() {
    const std::string db_conn = resolveConnectionString();

    // Nama tabel persis sesuai model EF Core (PascalCase).
    const TableRef source_table{"public", "GeneralJournal"};
    const TableRef archive_table{"archive", "GeneralJournal"};
    const TableRef periods_table{"public", "Periods"};

    const int interval_minutes = envInt("ARCHIVE_INTERVAL_MINUTES", 360);

    std::cout << "[Archiver Daemon] Service Archiver C++ dimulai...\n" << std::flush;

    DatabaseMigrator migrator(db_conn);
    ArchiverService archiver(db_conn);

    // Tidak pernah keluar dengan error: menunggu DB + migrasi backend selesai,
    // supaya supervisord tidak crash-loop dan tidak menghambat startup web.
    migrator.waitForSourceTable(source_table, 15);
    while (!migrator.runMigrations(source_table, archive_table)) {
        std::this_thread::sleep_for(std::chrono::seconds(30));
    }

    while (true) {
        archiver.archiveClosedPeriods(source_table, archive_table, periods_table);
        std::cout << cat("[Archiver Daemon] Pemeriksaan berikutnya ", interval_minutes, " menit lagi.\n")
                  << std::flush;
        std::this_thread::sleep_for(std::chrono::minutes(interval_minutes));
    }
}
