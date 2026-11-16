cmake_minimum_required(VERSION 3.20)

# A stale cache entry such as "g++" can prevent CMake from detecting the
# platform's default compiler. Keep valid explicit compiler choices intact.
if(DEFINED CMAKE_CXX_COMPILER AND NOT IS_ABSOLUTE "${CMAKE_CXX_COMPILER}")
    unset(_CMAKE_CXX_COMPILER_PATH CACHE)
    find_program(_CMAKE_CXX_COMPILER_PATH NAMES "${CMAKE_CXX_COMPILER}")
    if(_CMAKE_CXX_COMPILER_PATH)
        set(CMAKE_CXX_COMPILER "${_CMAKE_CXX_COMPILER_PATH}" CACHE FILEPATH "C++ compiler" FORCE)
    else()
        unset(CMAKE_CXX_COMPILER CACHE)
        unset(CMAKE_CXX_COMPILER)
    endif()
endif()

# Do not let an unresolved CXX environment setting reintroduce a stale compiler.
if(DEFINED ENV{CXX} AND NOT IS_ABSOLUTE "$ENV{CXX}")
    unset(_CXX_ENV_COMPILER_PATH CACHE)
    find_program(_CXX_ENV_COMPILER_PATH NAMES "$ENV{CXX}")
    if(_CXX_ENV_COMPILER_PATH)
        set(ENV{CXX} "${_CXX_ENV_COMPILER_PATH}")
    else()
        unset(ENV{CXX})
    endif()
endif()

# CMake cannot enable CXX if no compiler was specified or detected from the
# environment. Resolve common compiler names from PATH before project().
if(NOT CMAKE_CXX_COMPILER)
    find_program(_DEFAULT_CXX_COMPILER NAMES
        c++ c++.exe cxx cxx.exe
        gcc gcc-19 gcc-18 gcc-17 gcc-16 gcc-15 gcc-14 gcc-13 gcc-12 gcc-11 gcc-10 gcc-9 gcc-8
        gcc.exe gcc-19.exe gcc-18.exe gcc-17.exe gcc-16.exe gcc-15.exe gcc-14.exe gcc-13.exe gcc-12.exe gcc-11.exe gcc-10.exe gcc-9.exe gcc-8.exe
        g++ g++-19 g++-18 g++-17 g++-16 g++-15 g++-14 g++-13 g++-12 g++-11 g++-10 g++-9 g++-8
        g++.exe g++-19.exe g++-18.exe g++-17.exe g++-16.exe g++-15.exe g++-14.exe g++-13.exe g++-12.exe g++-11.exe g++-10.exe g++-9.exe g++-8.exe
        mingw32-g++ mingw32-g++.exe mingw32-gcc mingw32-gcc.exe
        x86_64-w64-mingw32-g++ x86_64-w64-mingw32-g++.exe
        x86_64-w64-mingw32-gcc x86_64-w64-mingw32-gcc.exe
        clang++ clang++-23 clang++-22 clang++-21 clang++-20 clang++-19 clang++-18 clang++-17 clang++-16 clang++-15 clang++-14 clang++-13 clang++-12 clang++-11 clang++-10
        clang++.exe clang++-23.exe clang++-22.exe clang++-21.exe clang++-20.exe clang++-19.exe clang++-18.exe clang++-17.exe clang++-16.exe clang++-15.exe clang++-14.exe clang++-13.exe clang++-12.exe clang++-11.exe clang++-10.exe
        clang-cl clang-cl.exe cl cl.exe
        icx icpx icpc
    )
    if(_DEFAULT_CXX_COMPILER)
        set(CMAKE_CXX_COMPILER "${_DEFAULT_CXX_COMPILER}" CACHE FILEPATH "C++ compiler")
    endif()
endif()

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