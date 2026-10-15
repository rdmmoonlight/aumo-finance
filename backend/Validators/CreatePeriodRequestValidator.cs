using AumoBackend.DTOs;
using FluentValidation;

namespace AumoBackend.Validators;

public class CreatePeriodRequestValidator : AbstractValidator<CreatePeriodRequest>
{
    private const int MaxAccountNameLength = 100; // selaras HasMaxLength(100) di AppDbContext

    public CreatePeriodRequestValidator()
    {
        // 1. Bulan & Tahun
        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12)
            .WithMessage("Please select a valid month.");

        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100)
            .WithMessage("Please provide a valid year.");

        // 2. Mode setup wajib salah satu dari dua nilai yang dikenal
        RuleFor(x => x.SetupMode)
            .Must(m => m == CreatePeriodRequest.ModeLoadExisting || m == CreatePeriodRequest.ModeCreateNew)
            .WithMessage("Please select a valid setup mode.");

        // 3. Mode: LoadExisting
        When(x => x.SetupMode == CreatePeriodRequest.ModeLoadExisting, () =>
        {
            const string selectMessage = "Please select the Cash, Bank, and Retained Earnings accounts to carry forward.";

            RuleFor(x => x.CashAccountId).NotNull().WithMessage(selectMessage);
            RuleFor(x => x.BankAccountId).NotNull().WithMessage(selectMessage);
            RuleFor(x => x.RetainedEarningsAccountId).NotNull().WithMessage(selectMessage);

            RuleFor(x => x.BankAccountId)
                .NotEqual(x => x.CashAccountId)
                .When(x => x.CashAccountId.HasValue && x.BankAccountId.HasValue)
                .WithMessage("Cash Account and Bank Account cannot be the same account.");

            RuleFor(x => x.RetainedEarningsAccountId)
                .NotEqual(x => x.CashAccountId)
                .When(x => x.CashAccountId.HasValue && x.RetainedEarningsAccountId.HasValue)
                .WithMessage("Retained Earnings Account must be different from the Cash and Bank accounts.");

            RuleFor(x => x.RetainedEarningsAccountId)
                .NotEqual(x => x.BankAccountId)
                .When(x => x.BankAccountId.HasValue && x.RetainedEarningsAccountId.HasValue)
                .WithMessage("Retained Earnings Account must be different from the Cash and Bank accounts.");
        });

        // 4. Mode: CreateNew
        When(x => x.SetupMode == CreatePeriodRequest.ModeCreateNew, () =>
        {
            const string completeMessage = "Please complete all new account fields (reference code & name).";
            const string numericMessage = "Account reference codes must be numeric.";
            var nameLengthMessage = $"Account names must not exceed {MaxAccountNameLength} characters.";

            RuleFor(x => x.CashAccountCode).NotEmpty().WithMessage(completeMessage);
            RuleFor(x => x.CashAccountName).NotEmpty().WithMessage(completeMessage);
            RuleFor(x => x.BankAccountCode).NotEmpty().WithMessage(completeMessage);
            RuleFor(x => x.BankAccountName).NotEmpty().WithMessage(completeMessage);
            RuleFor(x => x.RetainedEarningsAccountCode).NotEmpty().WithMessage(completeMessage);
            RuleFor(x => x.RetainedEarningsAccountName).NotEmpty().WithMessage(completeMessage);

            RuleFor(x => x.CashAccountCode)
                .Must(BeNumeric).When(x => !string.IsNullOrWhiteSpace(x.CashAccountCode))
                .WithMessage(numericMessage);
            RuleFor(x => x.BankAccountCode)
                .Must(BeNumeric).When(x => !string.IsNullOrWhiteSpace(x.BankAccountCode))
                .WithMessage(numericMessage);
            RuleFor(x => x.RetainedEarningsAccountCode)
                .Must(BeNumeric).When(x => !string.IsNullOrWhiteSpace(x.RetainedEarningsAccountCode))
                .WithMessage(numericMessage);

            RuleFor(x => x.CashAccountName).MaximumLength(MaxAccountNameLength).WithMessage(nameLengthMessage);
            RuleFor(x => x.BankAccountName).MaximumLength(MaxAccountNameLength).WithMessage(nameLengthMessage);
            RuleFor(x => x.RetainedEarningsAccountName).MaximumLength(MaxAccountNameLength).WithMessage(nameLengthMessage);

            // Ketiga kode harus berbeda (hanya dicek bila ketiganya numerik)
            RuleFor(x => x)
                .Must(HaveDistinctCodes)
                .When(x => BeNumeric(x.CashAccountCode) && BeNumeric(x.BankAccountCode) && BeNumeric(x.RetainedEarningsAccountCode))
                .WithMessage("Cash, Bank, and Retained Earnings accounts must use different reference numbers.");

            // Saldo awal tidak boleh negatif
            RuleFor(x => x.CashBalance)
                .GreaterThanOrEqualTo(0m).When(x => x.CashBalance.HasValue)
                .WithMessage("Opening balances cannot be negative.");
            RuleFor(x => x.BankBalance)
                .GreaterThanOrEqualTo(0m).When(x => x.BankBalance.HasValue)
                .WithMessage("Opening balances cannot be negative.");
        });
    }

    private static bool BeNumeric(string? value) => int.TryParse(value, out _);

    private static bool HaveDistinctCodes(CreatePeriodRequest r)
    {
        var codes = new[]
        {
            int.Parse(r.CashAccountCode!),
            int.Parse(r.BankAccountCode!),
            int.Parse(r.RetainedEarningsAccountCode!)
        };
        return codes.Distinct().Count() == codes.Length;
    }
}
