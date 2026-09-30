namespace AumoBackend.Core;

public class MobileLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class MobileLoginResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}

public class AccountDto
{
    public int Id { get; set; }
    public int ReferenceNumber { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class PeriodDto
{
    public int Id { get; set; }
    public string PeriodName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsClosed { get; set; }
    public bool IsSelected { get; set; }
}

public class CreateJournalEntryRequest
{
    public DateTime CreatedAt { get; set; }
    public DateTime EntryDate { get; set; }
    public string JournalType { get; set; } = "GJ"; // GJ = General Journal
    public string? MobileNote { get; set; }
    public List<CreateJournalEntryLineRequest> Lines { get; set; } = new();
}

public class CreateJournalEntryLineRequest
{
    public int AccountId { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? LineDescription { get; set; }
    public int LineOrder { get; set; }
}

// TOOLS / IMPORT DTOs
public class JournalImportRequestDto
{
    public int TargetYear { get; set; }
    public int TargetMonth { get; set; }
    public List<AccountMappingDetailDto> CustomMappings { get; set; } = new();
    public List<JournalTransactionDto> Transactions { get; set; } = new();
}

public class JournalTransactionDto
{
    public string Date { get; set; } = string.Empty;
    public DateTime EntryDate { get; set; }
    public string TransactionNumber { get; set; } = string.Empty;
    public string JournalType { get; set; } = "General";
    public List<JournalLineDto> Lines { get; set; } = new();
}

public class JournalLineDto
{
    public int AccountReferenceNumber { get; set; }
    public int RefNumber { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string LineDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? Debit { get; set; }
    public decimal? Credit { get; set; }
}

public class AccountMappingDetailDto
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public int ExcelRef { get; set; }
    public string ExcelAccountName { get; set; } = string.Empty;
    public int MappedRef { get; set; }
    public string MappedAccountName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class DashboardSummaryDto
{
    public int TotalJournal { get; set; }
    public int ActiveCoa { get; set; }
    public string ActivePeriodName { get; set; } = string.Empty;
    public bool IsPeriodOpen { get; set; }
}

public class CreatePeriodRequest
{
    public const string ModeLoadExisting = "LoadExisting";
    public const string ModeCreateNew = "CreateNew";

    public int Month { get; set; }
    public int Year { get; set; }
    public string SetupMode { get; set; } = ModeCreateNew;

    // Untuk Mode: LoadExisting
    public int? CashAccountId { get; set; }
    public int? BankAccountId { get; set; }
    public int? RetainedEarningsAccountId { get; set; }

    // Untuk Mode: CreateNew
    public string? CashAccountCode { get; set; }
    public string? CashAccountName { get; set; }
    public string? BankAccountCode { get; set; }
    public string? BankAccountName { get; set; }
    public string? RetainedEarningsAccountCode { get; set; }
    public string? RetainedEarningsAccountName { get; set; }

    // Opening Balances
    public decimal? CashBalance { get; set; }
    public decimal? BankBalance { get; set; }
}
