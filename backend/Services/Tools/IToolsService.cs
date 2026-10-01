using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.ViewModels;

namespace AumoBackend.Services.Tools;

public interface IToolsService
{
    byte[] GenerateJournalTemplate();
    Task<PreviewJournalImportViewModel> PreviewJournalImportAsync(Guid userId, JournalImportRequestDto request);
    Task<ImportJournalResultViewModel> ImportJournalEntriesAsync(Guid userId, JournalImportRequestDto request);
}
