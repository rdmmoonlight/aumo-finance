#include <iostream>
#include <thread>
#include <chrono>
#include <ctime>
#include <cstdlib>
#include <format>
#include "DatabaseMigrator.hpp"
#include "ArchiverService.hpp"

// Helper untuk menghitung durasi waktu tunggu sampai Tanggal 1 Bulan Depan jam 00:00:00
std::chrono::seconds getSecondsUntilNextMonthFirstDay() {
    auto now = std::chrono::system_clock::now();
    std::time_t now_c = std::chrono::system_clock::to_time_t(now);
    
    std::tm target_tm = *std::localtime(&now_c);
    target_tm.tm_mday = 1;
    target_tm.tm_hour = 0;
    target_tm.tm_min = 0;
    target_tm.tm_sec = 0;

    // Geser ke bulan berikutnya
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
    // 1. Ambil string koneksi DB dari Environment Variable (DATABASE_URL)
    const char* db_env = std::getenv("DATABASE_URL");
    std::string db_conn = db_env ? db_env : "host=localhost port=5432 dbname=aumo_db user=postgres password=secret";

    // Skema tabel: memindahkan dari public.journals ke archive.journals
    const std::string source_table = "public.journals";
    const std::string archive_table_name = "journals"; // nama tabel di dalam schema 'archive'
    const std::string full_archive_table = "archive.journals";

    std::cout << "[Archiver Daemon] Memulai C++ Archiver Standalone Service...\n";

    // 2. STEP MIGRASI: Pastikan Schema 'archive' dan Tabel 'archive.journals' Siap
    DatabaseMigrator migrator(db_conn);
    if (!migrator.runMigrations(source_table, archive_table_name)) {
        std::cerr << "[Fatal Error] Gagal mengeksekusi migrasi awal. Service dihentikan.\n";
        return 1;
    }

    ArchiverService archiver(db_conn);
    std::cout << "[Archiver Daemon] Inisialisasi sukses. Siap menjalankan scheduler.\n";

    // 3. LOOP SCHEDULER DAEMON (Eksekusi Setiap Tanggal 1 Awal Bulan)
    while (true) {
        auto wait_duration = getSecondsUntilNextMonthFirstDay();
        auto hours_left = std::chrono::duration_cast<std::chrono::hours>(wait_duration).count();

        std::cout << std::format("[Archiver Daemon] Menunggu eksekusi berikutnya (sekitar {} jam lagi pada awal bulan)...\n", hours_left);

        // Standby/Sleep hingga jadwal eksekusi tiba
        std::this_thread::sleep_for(wait_duration);

        // --- SAAT EKSEKUSI TIBA (TANGGAL 1 JAM 00:00:00) ---
        auto now = std::chrono::system_clock::now();
        std::time_t now_c = std::chrono::system_clock::to_time_t(now);
        std::tm current_tm = *std::localtime(&now_c);

        // Target yang diarsip adalah data 1 BULAN PENUH SEBELUMNYA
        int target_year = current_tm.tm_year + 1900;
        int target_month = current_tm.tm_mon; // tm_mon bernilai 0-11 (bulan saat ini 0 = Jan), sehingga nilai tm_mon pas mewakili angka bulan lalu (1-12)

        if (target_month == 0) {
            target_month = 12;
            target_year -= 1;
        }

        std::cout << std::format("[Archiver Daemon] Eksekusi pengarsipan otomatis: {} -> {} | Periode: {:04d}-{:02d}\n", 
                                 source_table, full_archive_table, target_year, target_month);

        // Eksekusi pemindahan data antar-schema
        archiver.archiveMonthlyData(source_table, full_archive_table, target_year, target_month);
    }

    return 0;
}
