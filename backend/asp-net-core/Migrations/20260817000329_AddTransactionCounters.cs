#pragma warning disable CS1591

#nullable disable

namespace AumoBackend.Migrations
{
    using Microsoft.EntityFrameworkCore.Migrations;

    public partial class AddTransactionCounters : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tabel TransactionCounters ditambahkan manual lewat Neon SQL
            // Editor (lihat Migrations/manual-neon-run-transaction-counters.sql),
            // jadi Up() di sini dibiarkan kosong agar tidak error/duplikat
            // saat aplikasi start.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
