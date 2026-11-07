#include <iostream>
#include <thread>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <cstdlib>
#include "ArchiverService.hpp"

// Helper untuk mendapatkan waktu sekarang dan menentukan delay ke Tanggal 1 bulan depan
std::chrono::seconds getSecondsUntilNextMonthFirstDay() {
    auto now = std::chrono::system_clock::now();
    std::time_t now_c = std::chrono::system_clock::to_time_t(now);
    std::tm now_tm = *std::localtime(&now_c);

    // Tentukan waktu target: Tanggal 1 bulan depan jam 00:00:00
    std::tm target_tm = now_tm;
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
    // 1. Ambil koneksi DB asli dari Environment Variables (Lebih aman untuk docker/production)
    const char* db_env = std::getenv("DATABASE_URL");
    std::string db_conn = db_env ? db_env : "host=localhost port=5432 dbname=aumo_db user=postgres password=secret";

    ArchiverService archiver(db_conn);

    std::cout << "[Archiver Daemon] Service C++ Archiver standalone berhasil diawali.\n";

    while (true) {
        // Hitung delay sampai tanggal 1 bulan depan jam 00:00
        auto wait_duration = getSecondsUntilNextMonthFirstDay();
        auto hours_left = std::chrono::duration_cast<std::chrono::hours>(wait_duration).count();

        std::cout << "[Archiver Daemon] Menunggu eksekusi berikutnya (sekitar " 
                  << hours_left << " jam lagi, pada awal bulan)...\n";

        // Tidur sampai waktu eksekusi tiba
        std::this_thread::sleep_for(wait_duration);

        // --- SAAT EXECUTED (Tanggal 1 Awal Bulan) ---
        auto now = std::chrono::system_clock::now();
        std::time_t now_c = std::chrono::system_clock::to_time_t(now);
        std::tm current_tm = *std::localtime(&now_c);

        // Yang diarsip adalah data BULAN LALU
        int target_year = current_tm.tm_year + 1900;
        int target_month = current_tm.tm_mon; // tm_mon 0-11, jadi nilai tm_mon sekarang = bulan lalu secara angka 1-12

        if (target_month == 0) {
            target_month = 12;
            target_year -= 1;
        }

        std::cout << "[Archiver Daemon] Eksekusi pengarsipan otomatis untuk periode: " 
                  << target_year << "-" << target_month << "\n";

        // Hubungkan ke tabel DB asli kamu
        archiver.archiveMonthlyData("journals", "journals_archive", target_year, target_month);
    }

    return 0;
}
