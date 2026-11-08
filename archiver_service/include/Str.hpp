#pragma once

#include <sstream>
#include <string>

// Penggabung string sederhana (pengganti std::format agar kode bisa dibangun
// dengan C++17, standar yang cocok dengan libpqxx 7.8 di Ubuntu 24.04).
template <typename... Args>
std::string cat(const Args&... args) {
    std::ostringstream os;
    (os << ... << args);
    return os.str();
}
