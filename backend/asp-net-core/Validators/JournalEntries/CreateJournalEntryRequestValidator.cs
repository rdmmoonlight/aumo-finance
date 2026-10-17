// <copyright file="CreateJournalEntryRequestValidator.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Validators.JournalEntries;

using AumoBackend.DTOs;

/// <summary>
/// Validator untuk Create Journal Entry Request Validator.
/// </summary>
public class CreateJournalEntryRequestValidator : JournalEntryValidatorBase<CreateJournalEntryRequest>
{
    /// <summary>
    /// Validator untuk Create Journal Entry Request Validator.
    /// </summary>
    public CreateJournalEntryRequestValidator()
        : base(x => x.EntryDate, x => x.JournalType, x => x.Lines)
    {
    }
}