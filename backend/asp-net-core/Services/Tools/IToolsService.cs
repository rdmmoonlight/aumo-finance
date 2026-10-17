// <copyright file="IToolsService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Tools;

using AumoBackend.DTOs;
using AumoBackend.ViewModels;
/// <summary>
/// Layanan logika bisnis untuk I Tools Service.
/// </summary>

public interface IToolsService
{
    /// <summary>
    /// Proses eksekusi kalkulasi Generate Journal Template.
    /// </summary>
    byte[] GenerateJournalTemplate();
    /// <summary>
    /// Mewakili Preview Journal Import Async.
    /// </summary>

    Task<PreviewJournalImportViewModel> PreviewJournalImportAsync(Guid userId, JournalImportRequestDto request);
    /// <summary>
    /// Mewakili Import Journal Entries Async.
    /// </summary>

    Task<ImportJournalResultViewModel> ImportJournalEntriesAsync(Guid userId, JournalImportRequestDto request);
}
