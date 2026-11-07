#pragma once

#include <string>

class ArchiverService {
private:
    std::string connection_string;

public:
    explicit ArchiverService(std::string db_conn_str);

    // Fungsi utama pemindahan data berdasarkan bulan & tahun
    bool archiveMonthlyData(const std::string& source_table, 
                            const std::string& target_table, 
                            int year, 
                            int month);
};
