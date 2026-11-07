cmake_minimum_required(VERSION 3.20)
project(ArchiverService CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(PkgConfig REQUIRED)
# Import target PkgConfig::PQXX secara otomatis
pkg_check_modules(PQXX REQUIRED IMPORTED_TARGET libpqxx)

include_directories(
    archiver_service/include
)

file(GLOB_RECURSE SOURCES "archiver_service/*.cpp")

add_executable(archiver_service ${SOURCES})

# Link ke Imported Target PkgConfig dan libpq
target_link_libraries(archiver_service PRIVATE PkgConfig::PQXX pq)
