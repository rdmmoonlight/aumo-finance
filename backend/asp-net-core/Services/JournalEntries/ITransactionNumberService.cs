// <copyright file="ITransactionNumberService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.JournalEntries;

public interface ITransactionNumberService
{
    Task<string> GenerateAsync(Guid userId, string journalType, DateTime entryDate);

    Task<string> PeekNextAsync(Guid userId, string journalType, DateTime entryDate);
}
