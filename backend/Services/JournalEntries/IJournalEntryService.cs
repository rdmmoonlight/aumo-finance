using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.JournalEntries;

public interface IJournalEntryService
{
    Task<JournalEntryResponseDto?> GetByIdAsync(Guid userId, int id);
    Task<CreateJournalEntryResponseDto> CreateAsync(Guid userId, CreateJournalEntryRequest request);
    Task UpdateAsync(Guid userId, int id, UpdateJournalEntryRequest request);
    Task DeleteAsync(Guid userId, int id);
    Task<List<string>> SearchDescriptionsAsync(Guid userId, string query);
    Task<string> GetNextTransactionNumberAsync(Guid userId, string journalType, DateTime? entryDate);
}
