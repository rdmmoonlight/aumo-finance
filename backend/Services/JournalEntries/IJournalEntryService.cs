// <copyright file="IJournalEntryService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.JournalEntries;

using AumoBackend.DTOs.Reports;

public interface IJournalEntryService
{
    // Mengambil daftar baris GeneralJournal berdasarkan TransactionNumber atau JournalEntryId
    Task<List<GeneralJournalResponseDto>> GetByTransactionNumberAsync(Guid userId, string transactionNumber);

    Task<GeneralJournalResponseDto?> GetByIdAsync(Guid userId, int lineId);

    // CRUD GeneralJournal
    Task<GeneralJournalResponseDto> CreateAsync(Guid userId, CreateGeneralJournalRequest request);

    Task UpdateAsync(Guid userId, int lineId, UpdateGeneralJournalRequest request);

    Task DeleteAsync(Guid userId, int lineId);

    Task DeleteByTransactionNumberAsync(Guid userId, string transactionNumber);

    // Pencarian LineDescription (karena Description header sudah dihapus)
    Task<List<string>> SearchLineDescriptionsAsync(Guid userId, string query);

    // Helper nomor transaksi berikutnya
    Task<string> GetNextTransactionNumberAsync(Guid userId, string journalType, DateTime? entryDate);
}