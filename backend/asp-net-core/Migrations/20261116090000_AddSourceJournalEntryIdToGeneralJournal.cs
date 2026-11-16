using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AumoBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceJournalEntryIdToGeneralJournal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SourceJournalEntryId",
                table: "GeneralJournal",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_GeneralJournal_SourceJournalEntryId",
                table: "GeneralJournal",
                column: "SourceJournalEntryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GeneralJournal_SourceJournalEntryId",
                table: "GeneralJournal");

            migrationBuilder.DropColumn(
                name: "SourceJournalEntryId",
                table: "GeneralJournal");
        }
    }
}
