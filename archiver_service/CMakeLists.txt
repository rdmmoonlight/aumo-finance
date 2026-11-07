cmake_minimum_required(VERSION 3.15)
project(archiver_service CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Drogon REQUIRED)

add_executable(archiver_service src/main.cpp)
target_link_libraries(archiver_service PRIVATE Drogon::Drogon)
