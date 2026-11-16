cmake_minimum_required(VERSION 3.20)
project(ArchiverService CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(PkgConfig REQUIRED)
pkg_check_modules(PQXX REQUIRED IMPORTED_TARGET libpqxx)

# CONFIGURE_DEPENDS agar file .cpp baru otomatis terdeteksi saat build
file(GLOB_RECURSE SOURCES CONFIGURE_DEPENDS "archiver-service/*.cpp")

add_executable(archiver-service ${SOURCES})

target_include_directories(archiver-service PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/archiver-service/include"
)

target_link_libraries(archiver-service PRIVATE PkgConfig::PQXX pq)