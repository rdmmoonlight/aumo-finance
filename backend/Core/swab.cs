using System;
using System.Collections.Generic;

namespace AumoBackend.Core
{
    // AUTH DTOs
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; }
        public string? UserAgent { get; set; }
        public string? OperatingSystem { get; set; }
    }

    // CHART OF ACCOUNTS DTOs
    public class CreateAccountRequest
    {
        public int ReferenceNumber { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class UpdateAccountRequest
    {
        public int ReferenceNumber { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    // JOURNAL ENTRY DTOs
    public class UpdateJournalEntryRequest
    {
        public DateTime EntryDate { get; set; }
        public string TransactionNumber { get; set; } = string.Empty;
        public string JournalType { get; set; } = "General";
        public DateTime UpdatedAt { get; set; }
        public List<JournalEntryLineRequest> Lines { get; set; } = new();
    }

    public class JournalEntryLineRequest
    {
        public int AccountId { get; set; }
        public string LineDescription { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public int LineOrder { get; set; }
    }

    // PERIODS DTOs
    public class CreatePeriodRequest
    {
        public string PeriodName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public string SetupMode { get; set; } = string.Empty;
        public static readonly string ModeLoadExisting = "LoadExisting";
        public int? CashAccountId { get; set; }
        public int? BankAccountId { get; set; }
        public int? RetainedEarningsAccountId { get; set; }
        public string? CashAccountCode { get; set; }
        public string? CashAccountName { get; set; }
        public string? BankAccountCode { get; set; }
        public string? BankAccountName { get; set; }
        public string? RetainedEarningsAccountCode { get; set; }
        public string? RetainedEarningsAccountName { get; set; }
        public decimal? CashBalance { get; set; }
        public decimal? BankBalance { get; set; }
    }

    // GENERAL LEDGER DTOs
    public class LedgerAccountResponse
    {
        public int AccountId { get; set; }
        public int ReferenceNumber { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool NormalBalanceIsDebit { get; set; }
        public decimal BeginningBalance { get; set; }
        public decimal EndingBalance { get; set; }
        public List<LedgerLineResponse> Lines { get; set; } = new();
    }

    public class LedgerLineResponse
    {
        public int JournalEntryId { get; set; }
        public string TransactionNumber { get; set; } = string.Empty;
        public string EntryDate { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal RunningBalance { get; set; }
    }

    // INCOME STATEMENT DTOs
    public class IncomeStatementApiResponse
    {
        public string PeriodName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime AsOfDate { get; set; }
        public decimal TotalRevenues { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalOperatingExpenses { get; set; }
        public decimal OperatingIncome { get; set; }
        public List<IncomeStatementLineApiResponse> OtherIncome { get; set; } = new();
        public decimal TotalOtherIncome { get; set; }
        public List<IncomeStatementLineApiResponse> OtherExpenses { get; set; } = new();
        public decimal TotalOtherExpenses { get; set; }
        public decimal NetIncome { get; set; }
        public List<IncomeStatementLineApiResponse> Revenues { get; set; } = new();
        public List<IncomeStatementLineApiResponse> Expenses { get; set; } = new();
        public List<IncomeStatementLineApiResponse> OperatingExpenses { get; set; } = new();
    }

    public class IncomeStatementLineApiResponse
    {
        public string ReferenceNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    // CLOSING JOURNALS DTOs
    public class ClosingJournalEntryGroupApiResponse
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public List<ClosingJournalLineApiResponse> Lines { get; set; } = new();
    }

    public class ClosingJournalLineApiResponse
    {
        public string ReferenceNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
    }

    // RETAINED EARNINGS DTOs
    public class RetainedEarningsApiResponse
    {
        public string PeriodName { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal BeginningBalance { get; set; }
        public decimal EndingBalance { get; set; }
        public decimal BeginningRetainedEarnings { get; set; }
        public decimal NetIncome { get; set; }
        public decimal Dividends { get; set; }
        public decimal EndingRetainedEarnings { get; set; }
    }

    // CASH FLOW DTOs
    public class StatementOfCashFlowLineResponse
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    // FINANCIAL POSITION DTOs
    public class StatementOfFinancialPositionApiResponse
    {
        public string PeriodName { get; set; } = string.Empty;
        public DateTime AsOfDate { get; set; }
        public decimal TotalAssets { get; set; }
        public decimal TotalLiabilities { get; set; }
        public decimal TotalEquity { get; set; }
        public decimal TotalLiabilitiesAndEquity { get; set; }
        public List<FinancialPositionLineApiResponse> EquityExcludingRetainedEarnings { get; set; } = new();
        public decimal RetainedEarningsEnding { get; set; }
        public bool IsPostClosing { get; set; }
        public bool IsBalanced { get; set; }
        public List<FinancialPositionLineApiResponse> Assets { get; set; } = new();
        public List<FinancialPositionLineApiResponse> Liabilities { get; set; } = new();
        public List<FinancialPositionLineApiResponse> Equity { get; set; } = new();
    }

    public class FinancialPositionLineApiResponse
    {
        public string ReferenceNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    // WORKSHEET DTOs
    public class WorksheetRowApiResponse
    {
        public int AccountId { get; set; }
        public int ReferenceNumber { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool NormalBalanceIsDebit { get; set; }
        public decimal UnadjustedDebit { get; set; }
        public decimal UnadjustedCredit { get; set; }
        public decimal AdjustmentDebit { get; set; }
        public decimal AdjustmentCredit { get; set; }
        public decimal AdjustingDebit { get; set; }
        public decimal AdjustingCredit { get; set; }
        public decimal AdjustedDebit { get; set; }
        public decimal AdjustedCredit { get; set; }
        public decimal IncomeStatementDebit { get; set; }
        public decimal IncomeStatementCredit { get; set; }
        public decimal BalanceSheetDebit { get; set; }
        public decimal BalanceSheetCredit { get; set; }
        public decimal FinancialPositionDebit { get; set; }
        public decimal FinancialPositionCredit { get; set; }
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