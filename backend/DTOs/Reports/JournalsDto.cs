// <copyright file="JournalsDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs.Reports;

// ==========================================
// RESPONSE DTOs
// ==========================================

/// <summary>
/// Response DTO untuk jurnal umum berstruktur Header + Lines (Grouped).
/// Digunakan sebagai return type utama pada IJournalEntryService.
/// </summary>
public class GeneralJournalResponseDto
{
    public int Id { get; set; }

    public int JournalEntryId
    {
        get => this.Id;
        set => this.Id = value;
    }

    public string JournalType { get; set; } = string.Empty;

    public DateTime EntryDate { get; set; }

    public string TransactionNumber { get; set; } = string.Empty;

    public Guid UserId { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool IsLocked { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public List<GeneralJournalLineDto> Lines { get; set; } = new();

    public decimal TotalDebit => this.Lines.Sum(l => l.Debit);

    public decimal TotalCredit => this.Lines.Sum(l => l.Credit);
}

/// <summary>
/// Alias agar kode lama yang mencari CreateGeneralJournalResponseDto tetap dapat terkompilasi.
/// </summary>
public class CreateGeneralJournalResponseDto : GeneralJournalResponseDto
{
}

/// <summary>
/// Detail baris (item line) untuk GeneralJournalResponseDto.
/// </summary>
public class GeneralJournalLineDto
{
    public int Id { get; set; }

    public int LineId
    {
        get => this.Id;
        set => this.Id = value;
    }

    public int AccountId { get; set; }

    public string? LineDescription { get; set; }

    public string? Description
    {
        get => this.LineDescription;
        set => this.LineDescription = value;
    }

    public decimal Debit { get; set; }

    public decimal Credit { get; set; }

    public int LineOrder { get; set; }
}

/// <summary>
/// DTO Datar (Flat) jika membutuhkan hasil query gabungan Header & Line dalam 1 objek tunggal.
/// </summary>
public class FlatGeneralJournalResponseDto
{
    public int LineId { get; set; }

    public int JournalEntryId { get; set; }

    public string JournalType { get; set; } = string.Empty;

    public DateTime EntryDate { get; set; }

    public string TransactionNumber { get; set; } = string.Empty;

    public Guid UserId { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int AccountId { get; set; }

    public string? LineDescription { get; set; }

    public decimal Debit { get; set; }

    public decimal Credit { get; set; }

    public int LineOrder { get; set; }
}

// ==========================================
// CLOSING JOURNAL DTOs
// ==========================================
public class ClosingJournalEntryGroupApiResponse
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public List<ClosingJournalLineApiResponse> Lines { get; set; } = new();

    public decimal TotalDebit => this.Lines.Sum(l => l.Debit);

    public decimal TotalCredit => this.Lines.Sum(l => l.Credit);
}

public class ClosingJournalLineApiResponse
{
    public string ReferenceNumber { get; set; } = "0";

    public string AccountName { get; set; } = string.Empty;

    public decimal Debit { get; set; }

    public decimal Credit { get; set; }
}

// ==========================================
// REQUEST DTOs
// ==========================================

/// <summary>
/// Request untuk membuat satu jurnal lengkap (Header info + multi-lines).
/// </summary>
public class CreateGeneralJournalRequest
{
    public string JournalType { get; set; } = string.Empty;

    public DateTime EntryDate { get; set; }

    public string TransactionNumber { get; set; } = string.Empty;

    public string Status { get; set; } = "Posted";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<CreateGeneralJournalLineRequest> Lines { get; set; } = new();
}

public class CreateGeneralJournalLineRequest
{
    public int AccountId { get; set; }

    public string? LineDescription { get; set; }

    public string? Description
    {
        get => this.LineDescription;
        set => this.LineDescription = value;
    }

    public decimal Debit { get; set; }

    public decimal Credit { get; set; }

    public int LineOrder { get; set; }
}

/// <summary>
/// Request untuk memperbarui header & baris jurnal.
/// </summary>
public class UpdateGeneralJournalRequest
{
    public string JournalType { get; set; } = string.Empty;

    public DateTime EntryDate { get; set; }

    public string TransactionNumber { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<CreateGeneralJournalLineRequest> Lines { get; set; } = new();
}