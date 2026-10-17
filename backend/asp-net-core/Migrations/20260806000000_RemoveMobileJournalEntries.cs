#pragma warning disable CS1591
// <copyright file="20260806000000_RemoveMobileJournalEntries.cs" company="PlaceholderCompany">
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
    /// Menghapus data  Mobile Journal Entries.
    /// </summary>
    /// <summary>
    /// Menghapus data  Mobile Journal Entries.
    /// </summary>
    /// <summary>
    /// Menghapus data  Mobile Journal Entries.
    /// </summary>
    /// <summary>
    /// Menghapus data  Mobile Journal Entries.
    /// </summary>
    /// <summary>
    /// Menghapus data  Mobile Journal Entries.
    /// </summary>
    public partial class RemoveMobileJournalEntries : Migration
    {
        /// <inheritdoc/>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Karena tabel di PostgreSQL sudah di-drop/backup manual,
            // metode Up dibiarkan kosong agar tidak error saat aplikasi dijalankan.
        }

        /// <inheritdoc/>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
