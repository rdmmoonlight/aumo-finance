using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AumoBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddGeneralJournalTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tabel GeneralJournal dibuat dan diisi (backfill) manual lewat Neon
            // SQL Editor (lihat Migrations/manual-neon-run-general-journal.sql),
            // jadi Up() di sini dibiarkan kosong agar tidak error/duplikat
            // saat aplikasi start.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
