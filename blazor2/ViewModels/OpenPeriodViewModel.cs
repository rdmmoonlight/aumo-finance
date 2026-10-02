namespace AumoBlazor.ViewModels;

public class AccountOptionViewModel
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class PermanentAccountItemViewModel
{
    public string AccountId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}

public class OpenPeriodViewModel
{
    public const string ModeLoadExisting = "LOAD_EXISTING";
    public const string ModeCreateNew = "CREATE_NEW";

    public int Month { get; set; } = DateTime.Today.Month;
    public int Year { get; set; } = DateTime.Today.Year;
    public string SetupMode { get; set; } = ModeLoadExisting;
    public bool HasExistingPermanentAccounts { get; set; }

    public string CashAccountId { get; set; } = string.Empty;
    public string CashAccountCode { get; set; } = "1101";
    public string CashAccountName { get; set; } = "Kas";
    public decimal CashBalance { get; set; }

    public string BankAccountId { get; set; } = string.Empty;
    public string BankAccountCode { get; set; } = "1102";
    public string BankAccountName { get; set; } = "Bank";
    public decimal BankBalance { get; set; }

    public string RetainedEarningsAccountId { get; set; } = string.Empty;
    public string RetainedEarningsAccountCode { get; set; } = "3201";
    public string RetainedEarningsAccountName { get; set; } = "Laba Ditahan";

    public List<AccountOptionViewModel> AvailableCashAndBankAccounts { get; set; } = new();
    public List<AccountOptionViewModel> AvailableRetainedEarningsAccounts { get; set; } = new();
    public List<PermanentAccountItemViewModel> PermanentAccounts { get; set; } = new();
}
