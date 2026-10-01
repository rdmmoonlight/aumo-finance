using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Models;
using AumoBackend.Services.Periods;
using System;
using System.Threading.Tasks;

namespace AumoBackend.Services.JournalEntries;

public interface ITransactionNumberService
{
    Task<string> GenerateAsync(Guid userId, string journalType, DateTime entryDate);
    Task<string> PeekNextAsync(Guid userId, string journalType, DateTime entryDate);
}
