cmake_minimum_required(VERSION 3.20)
project(ArchiverService CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(PkgConfig REQUIRED)
pkg_check_modules(PQXX REQUIRED libpqxx)

include_directories(
    archiver_service/include
    ${PQXX_INCLUDE_DIRS}
)

# Kumpulkan file source
file(GLOB_RECURSE SOURCES "archiver_service/*.cpp")

add_executable(archiver_service ${SOURCES})

# Tambahkan link directory jika ada
link_directories(${PQXX_LIBRARY_DIRS})

# Link library libpqxx beserta seluruh dependensinya (termasuk libpq)
target_link_libraries(archiver_service PRIVATE ${PQXX_LDFLAGS} ${PQXX_LIBRARIES} pq)
