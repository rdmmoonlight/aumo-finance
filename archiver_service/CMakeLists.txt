cmake_minimum_required(VERSION 3.20)
project(ArchiverService CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Sertakan folder header
include_directories(include)

# Cari driver database (contoh: PostgreSQL libpqxx)
find_package(pqxx REQUIRED)

# Kumpulkan semua source code
file(GLOB SOURCES "src/*.cpp")

add_executable(archiver_service ${SOURCES})
target_link_libraries(archiver_service PRIVATE pqxx::pqxx)
