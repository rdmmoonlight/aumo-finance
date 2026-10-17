#pragma warning disable CS1591
// <copyright file="20260730020100_AddMobileClassificationFields.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

#nullable disable

namespace AumoBackend.Migrations
{
    using AumoBackend.Controllers.Reports;
    using AumoBackend.Helpers;
    using AumoBackend.Models;
    using AumoBackend.Services.Auth;
    using AumoBackend.Services.Identity;
    using Microsoft.EntityFrameworkCore.Migrations;

    /// <summary>
    /// Membuat data  Mobile Classification Fields baru.
    /// </summary>
    /// <summary>
    /// Membuat data  Mobile Classification Fields baru.
    /// </summary>
    /// <summary>
    /// Membuat data  Mobile Classification Fields baru.
    /// </summary>
    /// <summary>
    /// Membuat data  Mobile Classification Fields baru.
    /// </summary>
    /// <inheritdoc />
    public partial class AddMobileClassificationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "NeedsClassification",
                table: "JournalEntries",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "JournalEntries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MobileNote",
                table: "JournalEntries",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NeedsClassification",
                table: "JournalEntries");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "JournalEntries");

            migrationBuilder.DropColumn(
                name: "MobileNote",
                table: "JournalEntries");
        }
    }
}
