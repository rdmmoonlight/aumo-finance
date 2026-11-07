cmake_minimum_required(VERSION 3.20)
project(ArchiverService CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 1. Sertakan folder include jika header ada di dalam archiver_service/
include_directories(archiver_service)
include_directories(archiver_service/include)

# 2. Cari PkgConfig & libpqxx
find_package(PkgConfig REQUIRED)
pkg_check_modules(PQXX REQUIRED libpqxx)
include_directories(${PQXX_INCLUDE_DIRS})

# 3. Kumpulkan semua file .cpp di dalam folder archiver_service (termasuk sub-foldernya)
file(GLOB_RECURSE SOURCES "archiver_service/*.cpp")

# 4. Target executable
add_executable(archiver_service ${SOURCES})

# 5. Link library libpqxx
target_link_libraries(archiver_service PRIVATE ${PQXX_LIBRARIES})
