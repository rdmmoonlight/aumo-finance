using FluentValidation;
using AumoBackend.Core;

namespace AumoBackend.Validators;

public class CreatePeriodRequestValidator : AbstractValidator<CreatePeriodRequest>
{
    public CreatePeriodRequestValidator()
    {
        // 1. Validasi Bulan & Tahun
        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12)
            .WithMessage("Please select a valid month.");

        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100)
            .WithMessage("Please provide a valid year.");

        // 2. Validasi Mode: LoadExisting
        When(x => x.SetupMode == CreatePeriodRequest.ModeLoadExisting, () =>
        {
            RuleFor(x => x.CashAccountId)
                .NotNull()
                .WithMessage("Please select the Cash, Bank, and Retained Earnings accounts to carry forward.");

            RuleFor(x => x.BankAccountId)
                .NotNull()
                .WithMessage("Please select the Cash, Bank, and Retained Earnings accounts to carry forward.");

            RuleFor(x => x.RetainedEarningsAccountId)
                .NotNull()
                .WithMessage("Please select the Cash, Bank, and Retained Earnings accounts to carry forward.");

            RuleFor(x => x.BankAccountId)
                .NotEqual(x => x.CashAccountId)
                .When(x => x.CashAccountId.HasValue && x.BankAccountId.HasValue)
                .WithMessage("Cash Account and Bank Account cannot be the same account.");
        });

        // 3. Validasi Mode: CreateNew (Default)
        When(x => x.SetupMode != CreatePeriodRequest.ModeLoadExisting, () =>
        {
            // Kelengkapan Field Akun Baru
            RuleFor(x => x.CashAccountCode)
                .NotEmpty()
                .WithMessage("Please complete all new account fields (reference code & name).");

            RuleFor(x => x.CashAccountName)
                .NotEmpty()
                .WithMessage("Please complete all new account fields (reference code & name).");

            RuleFor(x => x.BankAccountCode)
                .NotEmpty()
                .WithMessage("Please complete all new account fields (reference code & name).");

            RuleFor(x => x.BankAccountName)
                .NotEmpty()
                .WithMessage("Please complete all new account fields (reference code & name).");

            RuleFor(x => x.RetainedEarningsAccountCode)
                .NotEmpty()
                .WithMessage("Please complete all new account fields (reference code & name).");

            RuleFor(x => x.RetainedEarningsAccountName)
                .NotEmpty()
                .WithMessage("Please complete all new account fields (reference code & name).");

            // Validasi Format Angka untuk Kode Akun
            RuleFor(x => x.CashAccountCode)
                .Must(BeNumeric)
                .When(x => !string.IsNullOrWhiteSpace(x.CashAccountCode))
                .WithMessage("Account reference codes must be numeric.");

            RuleFor(x => x.BankAccountCode)
                .Must(BeNumeric)
                .When(x => !string.IsNullOrWhiteSpace(x.BankAccountCode))
                .WithMessage("Account reference codes must be numeric.");

            RuleFor(x => x.RetainedEarningsAccountCode)
                .Must(BeNumeric)
                .When(x => !string.IsNullOrWhiteSpace(x.RetainedEarningsAccountCode))
                .WithMessage("Account reference codes must be numeric.");
        });
    }

    private static bool BeNumeric(string? value)
    {
        return int.TryParse(value, out _);
    }
}
