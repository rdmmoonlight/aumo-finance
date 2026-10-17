#pragma warning disable CS1591
// <copyright file="20260816070000_AddJournalEntryUpdatedAt.cs" company="PlaceholderCompany">
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
    /// Membuat data  Journal Entry Updated At baru.
    /// </summary>
    /// <summary>
    /// Membuat data  Journal Entry Updated At baru.
    /// </summary>
    /// <summary>
    /// Membuat data  Journal Entry Updated At baru.
    /// </summary>
    /// <summary>
    /// Membuat data  Journal Entry Updated At baru.
    /// </summary>
    /// <inheritdoc />
    public partial class AddJournalEntryUpdatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Kolom JournalEntries.UpdatedAt ditambahkan manual lewat Neon SQL
            // Editor (lihat Migrations/manual-neon-run-journal-updatedat.sql),
            // jadi Up() di sini dibiarkan kosong agar tidak error/duplikat
            // saat aplikasi start.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}