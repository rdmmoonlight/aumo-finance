// <copyright file="UpdateJournalEntryRequestValidator.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Validators.JournalEntries;

using AumoBackend.DTOs;

/// <summary>
/// Validator untuk Update Journal Entry Request Validator.
/// </summary>
public class UpdateJournalEntryRequestValidator : JournalEntryValidatorBase<UpdateJournalEntryRequest>
{
    /// <summary>
    /// Validator untuk Update Journal Entry Request Validator.
    /// </summary>
    public UpdateJournalEntryRequestValidator()
        : base(x => x.EntryDate, x => x.JournalType, x => x.Lines)
    {
    }
}
