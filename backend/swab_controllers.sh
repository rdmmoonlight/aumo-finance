#!/bin/bash

CONTROLLERS_DIR="Controllers"
CORE_DIR="Core"
SWAB_FILE="${CORE_DIR}/swab.cs"

if [ ! -d "$CONTROLLERS_DIR" ]; then
    echo "[ERROR] Folder Controllers tidak ditemukan!"
    exit 1
fi

mkdir -p "$CORE_DIR"

echo "=== MEMULAI SWAB CONTROLLERS ==="
echo "Mencari deklarasi class, struct, record, atau enum di dalam Controllers..."
echo ""

# Mencari baris deklarasi yang berpotensi merupakan DTO/Model tambahan di dalam Controller
# Mengabaikan deklarasi utama 'public class XController'
DIRTY_LOGS=$(grep -rnE '^\s*(public|internal|private)?\s*(sealed\s+|abstract\s+)?(class|struct|record|enum)\s+[A-Za-z0-9_]+' "$CONTROLLERS_DIR" | grep -v "Controller :")

if [ -z "$DIRTY_LOGS" ]; then
    echo "[BERSIH] Selamat! Tidak ditemukan kelas/struct/record tersembunyi di folder Controllers."
    exit 0
else
    echo "[KOTOR] Ditemukan deklarasi kelas/struct/record terpisah di Controllers:"
    echo "----------------------------------------------------------------------"
    echo "$DIRTY_LOGS"
    echo "----------------------------------------------------------------------"
    echo ""
fi

# Inisialisasi file swab.cs jika belum ada
if [ ! -f "$SWAB_FILE" ]; then
    echo "Membuat file awal ${SWAB_FILE}..."
    cat <<EOF > "$SWAB_FILE"
namespace AumoBackend.Core
{
    // File ini menampung kelas/DTO/helper hasil pembersihan dari folder Controllers.
}
EOF
fi

echo "File target penampungan: ${SWAB_FILE}"
echo "Silahkan lakukan pemindahan (swab manual) untuk kelas-kelas yang terdeteksi di atas."