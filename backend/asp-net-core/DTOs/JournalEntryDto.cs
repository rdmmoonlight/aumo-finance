// <copyright file="JournalEntryDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs;

using System;
using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
/// <summary>
/// Model data Journal Entry Dto.
/// </summary>

public class JournalEntryDto
{
    /// <summary>
    /// Mewakili Date.
    /// </summary>
    public DateTime Date { get; set; }
/// <summary>
/// Mewakili Total Debit.
/// </summary>

    public decimal TotalDebit { get; set; }
/// <summary>
/// Mewakili Total Credit.
/// </summary>

    public decimal TotalCredit { get; set; }
}
/// <summary>
/// Model data Journal Entry Line Dto.
/// </summary>

public class JournalEntryLineDto
{
    /// <summary>
    /// Mewakili Account Id.
    /// </summary>
    public int AccountId { get; set; }
/// <summary>
/// Mewakili Line Description.
/// </summary>

    public string LineDescription { get; set; } = string.Empty;
/// <summary>
/// Mewakili Debit.
/// </summary>

    public decimal Debit { get; set; }
/// <summary>
/// Mewakili Credit.
/// </summary>

    public decimal Credit { get; set; }
/// <summary>
/// Mewakili Line Order.
/// </summary>

    public int LineOrder { get; set; }
}
/// <summary>
/// Model data Journal Entry Response Dto.
/// </summary>

public class JournalEntryResponseDto
{
    /// <summary>
    /// Mewakili Id.
    /// </summary>
    public int Id { get; set; }
/// <summary>
/// Mewakili Transaction Number.
/// </summary>

    public string TransactionNumber { get; set; } = string.Empty;
/// <summary>
/// Mewakili Journal Type.
/// </summary>

    public string JournalType { get; set; } = string.Empty;
/// <summary>
/// Mewakili Entry Date.
/// </summary>

    public DateTime EntryDate { get; set; }
/// <summary>
/// Membuat data d At baru.
/// </summary>

    public DateTime CreatedAt { get; set; }
/// <summary>
/// Memperbarui data d At.
/// </summary>

    public DateTime? UpdatedAt { get; set; }
/// <summary>
/// Mewakili Is Locked.
/// </summary>

    public bool IsLocked { get; set; }
/// <summary>
/// Mewakili Lines.
/// </summary>

    public List<JournalEntryLineResponseDto> Lines { get; set; } = new();
}
/// <summary>
/// Model data Journal Entry Line Response Dto.
/// </summary>

public class JournalEntryLineResponseDto
{
    /// <summary>
    /// Mewakili Id.
    /// </summary>
    public int Id { get; set; }
/// <summary>
/// Mewakili Account Id.
/// </summary>

    public int AccountId { get; set; }
/// <summary>
/// Mewakili Line Description.
/// </summary>

    public string? LineDescription { get; set; }
/// <summary>
/// Mewakili Debit.
/// </summary>

    public decimal Debit { get; set; }
/// <summary>
/// Mewakili Credit.
/// </summary>

    public decimal Credit { get; set; }
/// <summary>
/// Mewakili Line Order.
/// </summary>

    public int LineOrder { get; set; }
}
/// <summary>
/// Model data Create Journal Entry Request.
/// </summary>

public class CreateJournalEntryRequest
{
    /// <summary>
    /// Mewakili Journal Type.
    /// </summary>
    public string JournalType { get; set; } = "General";
/// <summary>
/// Mewakili Entry Date.
/// </summary>

    public DateTime EntryDate { get; set; }
/// <summary>
/// Membuat data d At baru.
/// </summary>

    public DateTime CreatedAt { get; set; }
/// <summary>
/// Mewakili Lines.
/// </summary>

    public List<JournalEntryLineDto> Lines { get; set; } = new();
}
/// <summary>
/// Model data Create Journal Entry Response Dto.
/// </summary>

public class CreateJournalEntryResponseDto
{
    /// <summary>
    /// Mewakili Entry Id.
    /// </summary>
    public int EntryId { get; set; }
/// <summary>
/// Mewakili Transaction Number.
/// </summary>

    public string TransactionNumber { get; set; } = string.Empty;
/// <summary>
/// Mewakili Message.
/// </summary>

    public string Message { get; set; } = string.Empty;
}
/// <summary>
/// Model data Update Journal Entry Request.
/// </summary>

public class UpdateJournalEntryRequest
{
    /// <summary>
    /// Mewakili Journal Type.
    /// </summary>
    public string JournalType { get; set; } = string.Empty;
/// <summary>
/// Mewakili Entry Date.
/// </summary>

    public DateTime EntryDate { get; set; }
/// <summary>
/// Memperbarui data d At.
/// </summary>

    public DateTime UpdatedAt { get; set; }
/// <summary>
/// Mewakili Lines.
/// </summary>

    public List<JournalEntryLineDto> Lines { get; set; } = new();
}
/// <summary>
/// Model data Create Journal Entry Line Request.
/// </summary>

public class CreateJournalEntryLineRequest
{
    /// <summary>
    /// Mewakili Account Id.
    /// </summary>
    public int AccountId { get; set; }
/// <summary>
/// Mewakili Debit.
/// </summary>

    public decimal Debit { get; set; }
/// <summary>
/// Mewakili Credit.
/// </summary>

    public decimal Credit { get; set; }
/// <summary>
/// Mewakili Line Description.
/// </summary>

    public string? LineDescription { get; set; }
/// <summary>
/// Mewakili Line Order.
/// </summary>

    public int LineOrder { get; set; }
}
/// <summary>
/// Model data Journal Entry Line Request.
/// </summary>

public class JournalEntryLineRequest
{
    /// <summary>
    /// Mewakili Account Id.
    /// </summary>
    public int AccountId { get; set; }
/// <summary>
/// Mewakili Line Description.
/// </summary>

    public string LineDescription { get; set; } = string.Empty;
/// <summary>
/// Mewakili Debit.
/// </summary>

    public decimal Debit { get; set; }
/// <summary>
/// Mewakili Credit.
/// </summary>

    public decimal Credit { get; set; }
/// <summary>
/// Mewakili Line Order.
/// </summary>

    public int LineOrder { get; set; }
}
