using System;
using System.Collections.Generic;

namespace AumoBackend.Core
{
    // AUTH DTOs
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; } = false;
        public bool IsMobileClient { get; set; } = false;
        public string? UserAgent { get; set; }
        public string? OperatingSystem { get; set; }
    }

    public class GoogleLoginRequest
    {
        public string IdToken { get; set; } = string.Empty;
        public bool IsMobileClient { get; set; } = false;
    }
    
    // TEST EMAIL DTOs
    public record ResendRequest(string Email);

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
}
