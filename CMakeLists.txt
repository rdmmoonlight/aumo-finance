cmake_minimum_required(VERSION 3.20)
project(ArchiverService CXX)

# C++17: cocok dengan libpqxx 7.8 (Ubuntu 24.04). Mode C++20 membuat link gagal
# (undefined reference pqxx::argument_error ... std::source_location).
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(PkgConfig REQUIRED)
# Import target PkgConfig::PQXX secara otomatis
pkg_check_modules(PQXX REQUIRED IMPORTED_TARGET libpqxx)

include_directories(
    archiver-service/include
)

file(GLOB_RECURSE SOURCES "archiver-service/*.cpp")

add_executable(archiver-service ${SOURCES})

# Link ke Imported Target PkgConfig dan libpq
target_link_libraries(archiver-service PRIVATE PkgConfig::PQXX pq)
