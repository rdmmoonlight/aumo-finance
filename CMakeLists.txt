cmake_minimum_required(VERSION 3.20)
project(ArchiverService CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# 1. Cari PkgConfig
find_package(PkgConfig REQUIRED)

# 2. Cari libpqxx via PkgConfig
pkg_check_modules(PQXX REQUIRED libpqxx)

# Include directory dari libpqxx
include_directories(${PQXX_INCLUDE_DIRS})

# Kumpulkan source code
file(GLOB SOURCES "src/*.cpp")
add_executable(archiver_service ${SOURCES})

# 3. Link library libpqxx
target_link_libraries(archiver_service PRIVATE ${PQXX_LIBRARIES})
