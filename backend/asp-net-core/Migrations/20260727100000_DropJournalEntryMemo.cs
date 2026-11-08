#pragma warning disable CS1591

#nullable disable

namespace AumoBackend.Migrations
{
    using Microsoft.EntityFrameworkCore.Migrations;

    public partial class DropJournalEntryMemo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Memo",
                table: "JournalEntries");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Memo",
                table: "JournalEntries",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);
        }
    }
}
