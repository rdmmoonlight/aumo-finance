// <copyright file="IJournalEntryService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.JournalEntries;

using AumoBackend.DTOs.Reports;
/// <summary>
/// Layanan logika bisnis untuk I Journal Entry Service.
/// </summary>

public interface IJournalEntryService
{
    /// <summary>
    /// Mengambil data  By Transaction Number Async.
    /// </summary>
    // Mengambil daftar baris GeneralJournal berdasarkan TransactionNumber atau JournalEntryId
    Task<List<GeneralJournalResponseDto>> GetByTransactionNumberAsync(Guid userId, string transactionNumber);
    /// <summary>
    /// Mengambil data  By Id Async.
    /// </summary>

    Task<GeneralJournalResponseDto?> GetByIdAsync(Guid userId, int lineId);
    /// <summary>
    /// Membuat data  Async baru.
    /// </summary>

    // CRUD GeneralJournal
    Task<GeneralJournalResponseDto> CreateAsync(Guid userId, CreateGeneralJournalRequest request);
    /// <summary>
    /// Memperbarui data  Async.
    /// </summary>

    Task UpdateAsync(Guid userId, int lineId, UpdateGeneralJournalRequest request);
    /// <summary>
    /// Menghapus data  Async.
    /// </summary>

    Task DeleteAsync(Guid userId, int lineId);
    /// <summary>
    /// Menghapus data  By Transaction Number Async.
    /// </summary>

    Task DeleteByTransactionNumberAsync(Guid userId, string transactionNumber);
    /// <summary>
    /// Mewakili Search Line Descriptions Async.
    /// </summary>

    // Pencarian LineDescription (karena Description header sudah dihapus)
    Task<List<string>> SearchLineDescriptionsAsync(Guid userId, string query);
    /// <summary>
    /// Mengambil data  Next Transaction Number Async.
    /// </summary>

    // Helper nomor transaksi berikutnya
    Task<string> GetNextTransactionNumberAsync(Guid userId, string journalType, DateTime? entryDate);
}
