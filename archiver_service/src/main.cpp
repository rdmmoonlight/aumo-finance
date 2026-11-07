#include <iostream>
#include <thread>
#include <chrono>
#include <ctime>
#include <cstdlib>
#include <format>
#include "DatabaseMigrator.hpp"
#include "ArchiverService.hpp"

std::chrono::seconds getSecondsUntilNextMonthFirstDay() {
    auto now = std::chrono::system_clock::now();
    std::time_t now_c = std::chrono::system_clock::to_time_t(now);
    
    std::tm target_tm = *std::localtime(&now_c);
    target_tm.tm_mday = 1;
    target_tm.tm_hour = 0;
    target_tm.tm_min = 0;
    target_tm.tm_sec = 0;

    if (target_tm.tm_mon == 11) {
        target_tm.tm_mon = 0;
        target_tm.tm_year += 1;
    } else {
        target_tm.tm_mon += 1;
    }

    std::time_t target_c = std::mktime(&target_tm);
    auto target_time = std::chrono::system_clock::from_time_t(target_c);

    return std::chrono::duration_cast<std::chrono::seconds>(target_time - now);
}

int main() {
    const char* db_env = std::getenv("DATABASE_URL");
    std::string db_conn = db_env ? db_env : "host=localhost port=5432 dbname=aumo_db user=postgres password=secret";

    // Nama tabel persis sesuai model EF Core (PascalCase)
    const std::string source_table = "public.\"GeneralJournal\"";
    const std::string archive_table_name = "\"GeneralJournal\"";
    const std::string full_archive_table = "archive.\"GeneralJournal\"";

    std::cout << "[Archiver Daemon] Service Archiver C++ siap diawali...\n";

    // Run Migrator (Membuat schema archive & archive.general_journals jika belum ada)
    DatabaseMigrator migrator(db_conn);
    if (!migrator.runMigrations(source_table, archive_table_name)) {
        std::cerr << "[Fatal Error] Migrasi schema gagal. Service dihentikan.\n";
        return 1;
    }

    ArchiverService archiver(db_conn);

    while (true) {
        auto wait_duration = getSecondsUntilNextMonthFirstDay();
        auto hours_left = std::chrono::duration_cast<std::chrono::hours>(wait_duration).count();

        std::cout << std::format("[Archiver Daemon] Menunggu eksekusi berikutnya (~{} jam lagi pada awal bulan)...\n", hours_left);

        std::this_thread::sleep_for(wait_duration);

        // Eksekusi pada tanggal 1 awal bulan untuk data bulan lalu
        auto now = std::chrono::system_clock::now();
        std::time_t now_c = std::chrono::system_clock::to_time_t(now);
        std::tm current_tm = *std::localtime(&now_c);

        int target_year = current_tm.tm_year + 1900;
        int target_month = current_tm.tm_mon; 

        if (target_month == 0) {
            target_month = 12;
            target_year -= 1;
        }

        archiver.archiveMonthlyData(source_table, full_archive_table, target_year, target_month);
    }

    return 0;
}
