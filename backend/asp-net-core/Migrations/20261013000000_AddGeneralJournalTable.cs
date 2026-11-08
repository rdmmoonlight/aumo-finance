#pragma warning disable CS1591

#nullable disable

namespace AumoBackend.Migrations
{
    using Microsoft.EntityFrameworkCore.Migrations;

    public partial class AddGeneralJournalTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tabel GeneralJournal dibuat dan diisi (backfill) manual lewat Neon
            // SQL Editor (lihat Migrations/manual-neon-run-general-journal.sql),
            // jadi Up() di sini dibiarkan kosong agar tidak error/duplikat
            // saat aplikasi start.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
