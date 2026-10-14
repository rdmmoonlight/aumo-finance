using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AumoBackend.Migrations
{
    /// <inheritdoc />
    public partial class DropOldJournalTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tabel JournalEntries dan JournalEntryLines dihapus manual lewat Neon
            // SQL Editor (lihat Migrations/manual-neon-run-drop-old-journal-tables.sql),
            // jadi Up() di sini dibiarkan kosong agar tidak error saat aplikasi start.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
