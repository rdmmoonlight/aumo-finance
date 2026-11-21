cmake_minimum_required(VERSION 3.20)

# Daftar folder standar instalasi MinGW / MSYS2 di Windows sebagai fallback jika belum ada di PATH
set(_MINGW_SEARCH_HINTS
    "C:/msys64/ucrt64/bin"
    "C:/msys64/mingw64/bin"
    "C:/mingw64/bin"
    "C:/MinGW/bin"
)

# Bersihkan cache compiler jika menunjuk ke nama relatif yang tidak valid
if(DEFINED CMAKE_CXX_COMPILER AND NOT IS_ABSOLUTE "${CMAKE_CXX_COMPILER}")
    unset(_CMAKE_CXX_COMPILER_PATH CACHE)
    find_program(_CMAKE_CXX_COMPILER_PATH
        NAMES "${CMAKE_CXX_COMPILER}"
        HINTS ${_MINGW_SEARCH_HINTS}
    )
    if(_CMAKE_CXX_COMPILER_PATH)
        set(CMAKE_CXX_COMPILER "${_CMAKE_CXX_COMPILER_PATH}" CACHE FILEPATH "C++ compiler" FORCE)
    else()
        unset(CMAKE_CXX_COMPILER CACHE)
        unset(CMAKE_CXX_COMPILER)
    endif()
endif()

# Bersihkan environment variable CXX jika tidak valid
if(DEFINED ENV{CXX} AND NOT IS_ABSOLUTE "$ENV{CXX}")
    unset(_CXX_ENV_COMPILER_PATH CACHE)
    find_program(_CXX_ENV_COMPILER_PATH
        NAMES "$ENV{CXX}"
        HINTS ${_MINGW_SEARCH_HINTS}
    )
    if(_CXX_ENV_COMPILER_PATH)
        set(ENV{CXX} "${_CXX_ENV_COMPILER_PATH}")
    else()
        unset(ENV{CXX})
    endif()
endif()

# Cari compiler C++ sebelum project() (prioritaskan g++ dibanding gcc)
if(NOT CMAKE_CXX_COMPILER)
    find_program(_DEFAULT_CXX_COMPILER
        NAMES
            g++ g++.exe
            x86_64-w64-mingw32-g++ x86_64-w64-mingw32-g++.exe
            mingw32-g++ mingw32-g++.exe
            clang++ clang++.exe
            c++ c++.exe
            cl cl.exe
        HINTS ${_MINGW_SEARCH_HINTS}
    )
    if(_DEFAULT_CXX_COMPILER)
        set(CMAKE_CXX_COMPILER "${_DEFAULT_CXX_COMPILER}" CACHE FILEPATH "C++ compiler" FORCE)
    endif()
endif()

project(ArchiverService CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Mencari seluruh file .cpp hanya di dalam folder src/
file(GLOB_RECURSE SOURCES CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")

add_executable(archiver-service ${SOURCES})

# Header files berada di dalam archiver-service/include/
target_include_directories(archiver-service PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/include"
)

# Pencarian library Poco
find_package(Poco REQUIRED COMPONENTS Foundation Util)
target_link_libraries(archiver-service PRIVATE
    Poco::Foundation
    Poco::Util
)

# Pencarian library libpqxx (mendukung vcpkg/CMake Config maupun PkgConfig di Linux/MSYS2)
find_package(libpqxx CONFIG QUIET)
if(libpqxx_FOUND)
    target_link_libraries(archiver-service PRIVATE libpqxx::pqxx)
else()
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(PQXX REQUIRED IMPORTED_TARGET libpqxx)
    target_link_libraries(archiver-service PRIVATE PkgConfig::PQXX pq)
endif()
