#!/usr/bin/env bash

# Dapatkan lokasi folder root repositori & folder debugging
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Buat folder logs di dalam /debugging jika belum ada
LOGS_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOGS_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOGS_DIR/build_$TIMESTAMP.txt"

COLOR_RED="\033[1;31m"
COLOR_GREEN="\033[1;32m"
COLOR_YELLOW="\033[1;33m"
COLOR_BLUE="\033[1;34m"
COLOR_CYAN="\033[1;36m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_BLUE}====================================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}       AUMO GLOBAL DEBUGGING & LOGGING SYSTEM       ${COLOR_RESET}"
echo -e "${COLOR_BLUE}====================================================${COLOR_RESET}"

# 1. Jalankan perbaikan Python di root /debugging (Output ke console, tidak ke log)
echo -e "${COLOR_YELLOW}[1/3] Executing /debugging/fix.py...${COLOR_RESET}"
python "$SCRIPT_DIR/fix.py"

# 2. Pindah ke target (default: backend)
TARGET_DIR="${1:-backend}"
echo -e "\n${COLOR_YELLOW}[2/3] Switching to target directory: $TARGET_DIR...${COLOR_RESET}"

if [ -d "$ROOT_DIR/$TARGET_DIR" ]; then
    cd "$ROOT_DIR/$TARGET_DIR" || exit 1
else
    echo -e "${COLOR_RED}[!] Directory $ROOT_DIR/$TARGET_DIR not found!${COLOR_RESET}"
    exit 1
fi

# 3. Clean & Build
echo -e "\n${COLOR_YELLOW}[3/3] Running build on $TARGET_DIR...${COLOR_RESET}"
dotnet clean > /dev/null 2>&1

# Capture stdout & stderr dotnet build secara akurat
TEMP_BUILD_LOG=$(mktemp)
dotnet build /clp:NoSummary > "$TEMP_BUILD_LOG" 2>&1
BUILD_STATUS=${PIPESTATUS[0]} # Menangkap exit code murni dari dotnet build

echo -e "\n${COLOR_BLUE}====================================================${COLOR_RESET}"

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "${COLOR_GREEN}       [✓] BUILD SUCCESSFUL! NO ERRORS FOUND        ${COLOR_RESET}"
    echo -e "${COLOR_BLUE}====================================================${COLOR_RESET}"
    # Hapus file temp karena tidak ada error
    rm -f "$TEMP_BUILD_LOG"
else
    # Filter HANYA baris error CS tanpa warna ANSI ke file log txt
    grep "error CS" "$TEMP_BUILD_LOG" | sed 's/\x1b\[[0-9;]*m//g' > "$LOG_FILE"
    TOTAL_ERRORS=$(wc -l < "$LOG_FILE" | tr -d ' ')

    echo -e "${COLOR_RED}       [!] BUILD FAILED ($TOTAL_ERRORS Error(s) Found)     ${COLOR_RESET}"
    echo -e "${COLOR_BLUE}====================================================${COLOR_RESET}"

    echo -e "\n${COLOR_YELLOW}--- TOP ERROR SUMMARY ---${COLOR_RESET}"
    awk -F'error ' '{print $2}' "$LOG_FILE" | sort | uniq -c | head -n 10

    echo -e "\n${COLOR_CYAN}--> Detail error lengkap tersimpan di:${COLOR_RESET}"
    echo -e "    ${COLOR_YELLOW}$LOG_FILE${COLOR_RESET}"
    
    # Hapus file temp
    rm -f "$TEMP_BUILD_LOG"
fi

echo -e "${COLOR_BLUE}====================================================${COLOR_RESET}"