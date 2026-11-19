#include <Poco/AutoPtr.h>
#include <Poco/ConsoleChannel.h>
#include <Poco/Environment.h>
#include <Poco/FormattingChannel.h>
#include <Poco/Logger.h>
#include <Poco/PatternFormatter.h>
#include <Poco/Util/ServerApplication.h>
#include <Poco/Util/Timer.h>
#include <Poco/Util/TimerTask.h>

#include <algorithm>
#include <atomic>
#include <cctype>
#include <chrono>
#include <initializer_list>
#include <map>
#include <memory>
#include <string>
#include <thread>

#include "ArchiverService.hpp"
#include "DatabaseMigrator.hpp"
#include "Str.hpp"
#include "TableRef.hpp"

namespace {

std::string lower(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return s;
}

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
        for (auto n : names) {
            if (kv.count(n)) return kv[n];
        }
        return "";
    };

    std::string out;
    auto add = [&](const char* k, const std::string& v) {
        if (v.empty()) return;
        std::string esc;
        for (char c : v) {
            if (c == '\\' || c == '\'') esc += '\\';
            esc += c;
        }
        out += cat(k, "='", esc, "' ");
    };

    add("host", get({"host", "server"}));
    add("port", get({"port"}));
    add("dbname", get({"database", "dbname"}));
    add("user", get({"username", "userid", "uid", "user"}));
    add("password", get({"password", "pwd"}));

    std::string ssl = lower(get({"sslmode"}));
    if (ssl == "require" || ssl == "verifyfull" || ssl == "verifyca") {
        out += "sslmode=require ";
    } else if (ssl == "disable") {
        out += "sslmode=disable ";
    }
    return out;
}

std::string resolveConnectionString() {
    if (Poco::Environment::has("DATABASE_URL")) {
        std::string url = Poco::Environment::get("DATABASE_URL");
        if (!url.empty()) return url;
    }
    if (Poco::Environment::has("ConnectionStrings__DefaultConnection")) {
        std::string dn = Poco::Environment::get("ConnectionStrings__DefaultConnection");
        if (!dn.empty()) {
            if (dn.rfind("postgres://", 0) == 0 || dn.rfind("postgresql://", 0) == 0) return dn;
            return npgsqlToLibpq(dn);
        }
    }
    return "host=localhost port=5432 dbname=aumo_db user=postgres password=secret";
}

} // namespace

// ============================================================================
// Worker Task (Setara dengan ExecuteAsync pada BackgroundService .NET)
// ============================================================================
class ArchiveWorkerTask : public Poco::Util::TimerTask {
public:
    ArchiveWorkerTask(ArchiverService& archiver,
                      DatabaseMigrator& migrator,
                      const TableRef& source,
                      const TableRef& archive,
                      const TableRef& periods,
                      bool purge_enabled,
                      int interval_minutes,
                      std::atomic<bool>& stop_requested)
        : _archiver(archiver),
          _migrator(migrator),
          _source(source),
          _archive(archive),
          _periods(periods),
          _purge_enabled(purge_enabled),
          _interval_minutes(interval_minutes),
          _stop_requested(stop_requested),
          _logger(Poco::Logger::get("ArchiverWorker")) {}

    void run() override {
        if (_stop_requested.load()) return;

        try {
            // Pastikan migrasi selesai sebelum siklus pengarsipan pertama berjalan
            if (!_migrated) {
                _logger.information("Menunggu tabel sumber dan menjalankan migrasi...");
                _migrator.waitForSourceTable(_source, 15);
                if (_stop_requested.load()) return;

                if (!_migrator.runMigrations(_source, _archive)) {
                    _logger.warning("Migrasi belum siap, akan dicoba ulang pada siklus berikutnya.");
                    return;
                }
                _migrated = true;
                _logger.information("Migrasi database berhasil diverifikasi.");
            }

            _logger.information("Memulai siklus pengarsipan periode tutup buku...");
            if (_archiver.archiveClosedPeriods(_source, _archive, _periods) && _purge_enabled) {
                _archiver.purgeArchivedClosedPeriods(_source, _archive, _periods);
            }

            _logger.information("Selesai. Pemeriksaan berikutnya dalam %d menit.", _interval_minutes);
        } catch (const std::exception& ex) {
            _logger.error("Terjadi kesalahan saat eksekusi worker: %s", std::string(ex.what()));
        } catch (...) {
            _logger.error("Terjadi kesalahan tidak dikenal pada worker.");
        }
    }

private:
    ArchiverService& _archiver;
    DatabaseMigrator& _migrator;
    TableRef _source;
    TableRef _archive;
    TableRef _periods;
    bool _purge_enabled;
    int _interval_minutes;
    std::atomic<bool>& _stop_requested;
    bool _migrated{false};
    Poco::Logger& _logger;
};

// ============================================================================
// Application Host (Setara dengan Generic Host / ServerApplication)
// ============================================================================
class ArchiverApplication : public Poco::Util::ServerApplication {
protected:
    void initialize(Application& self) override {
        loadConfiguration(); // Muat konfigurasi default POCO (opsional)
        ServerApplication::initialize(self);

        // Konfigurasi standar format log ke stdout/stderr (ramah Docker & Supervisord)
        Poco::AutoPtr<Poco::ConsoleChannel> console_channel(new Poco::ConsoleChannel);
        Poco::AutoPtr<Poco::PatternFormatter> formatter(
            new Poco::PatternFormatter("%Y-%m-%d %H:%M:%S [%p] [%s] %t"));
        Poco::AutoPtr<Poco::FormattingChannel> formatting_channel(
            new Poco::FormattingChannel(formatter, console_channel));
        Poco::Logger::root().setChannel(formatting_channel);
        Poco::Logger::root().setLevel("information");
    }

    void uninitialize() override {
        logger().information("Membersihkan resource Archiver Daemon...");
        ServerApplication::uninitialize();
    }

    int main(const std::vector<std::string>& args) override {
        const std::string db_conn = resolveConnectionString();

        // Pembacaan konfigurasi terstandar melalui layer konfigurasi POCO
        // Mendukung env var langsung dengan prefix system.env.*
        int interval_minutes = 360;
        if (Poco::Environment::has("ARCHIVE_INTERVAL_MINUTES")) {
            try {
                interval_minutes = std::max(1, std::stoi(Poco::Environment::get("ARCHIVE_INTERVAL_MINUTES")));
            } catch (...) {}
        }

        bool purge_enabled = true;
        if (Poco::Environment::has("ARCHIVE_PURGE_ENABLED")) {
            std::string v = lower(Poco::Environment::get("ARCHIVE_PURGE_ENABLED"));
            purge_enabled = !(v == "0" || v == "false" || v == "no" || v == "off");
        }

        const TableRef source_table{"public", "GeneralJournal"};
        const TableRef archive_table{"archive", "GeneralJournal"};
        const TableRef periods_table{"public", "Periods"};

        DatabaseMigrator migrator(db_conn);
        ArchiverService archiver(db_conn);

        logger().information("Service Archiver C++ dimulai (Interval: %d menit, Purge: %b).",
                             interval_minutes, purge_enabled);

        Poco::Util::Timer timer;
        const long interval_ms = static_cast<long>(interval_minutes) * 60 * 1000;

        // Jalankan langsung saat startup (delay 0 ms), lalu ulangi setiap interval_ms
        // scheduleAtFixedRate menjamin tidak terjadi penumpukan tugas jika eksekusi memakan waktu lama
        timer.schedule(
            new ArchiveWorkerTask(archiver, migrator, source_table, archive_table,
                                  periods_table, purge_enabled, interval_minutes, _stop_requested),
            0,
            interval_ms
        );

        // Blokir thread utama sampai menerima SIGTERM / SIGINT dari Docker atau Supervisord
        waitForTerminationRequest();

        logger().information("Sinyal berhenti diterima. Menghentikan scheduler...");
        _stop_requested.store(true);
        timer.cancel(true); // Tunggu tugas yang sedang berjalan selesai sebelum keluar

        return Application::EXIT_OK;
    }

private:
    std::atomic<bool> _stop_requested{false};
};

int main(int argc, char** argv) {
    ArchiverApplication app;
    return app.run(argc, argv);
}