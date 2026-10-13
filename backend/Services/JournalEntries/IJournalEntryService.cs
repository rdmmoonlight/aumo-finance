using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AumoBackend.DTOs.Reports;

namespace AumoBackend.Services.JournalEntries;

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