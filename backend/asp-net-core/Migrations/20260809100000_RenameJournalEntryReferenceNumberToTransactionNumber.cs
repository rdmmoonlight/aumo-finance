#pragma warning disable CS1591
// <copyright file="20260809100000_RenameJournalEntryReferenceNumberToTransactionNumber.cs" company="PlaceholderCompany">
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
    /// Mewakili Rename Journal Entry Reference Number To Transaction Number.
    /// </summary>
    /// <summary>
    /// Mewakili Rename Journal Entry Reference Number To Transaction Number.
    /// </summary>
    /// <summary>
    /// Mewakili Rename Journal Entry Reference Number To Transaction Number.
    /// </summary>
    /// <summary>
    /// Mewakili Rename Journal Entry Reference Number To Transaction Number.
    /// </summary>
    /// <summary>
    /// Mewakili Rename Journal Entry Reference Number To Transaction Number.
    /// </summary>
    public partial class RenameJournalEntryReferenceNumberToTransactionNumber : Migration
    {
        /// <inheritdoc/>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Kolom JournalEntries.ReferenceNumber di-rename ke TransactionNumber
            // secara manual lewat Neon SQL Editor (lihat
            // Migrations/manual-neon-run-transaction-number.sql), jadi Up() di sini
            // dibiarkan kosong agar tidak error/duplikat saat aplikasi start.
        }

        /// <inheritdoc/>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}