using AumoBackend.DTOs;
using AumoBackend.Models;
using FluentValidation;

namespace AumoBackend.Validators.ChartOfAccounts;

public class UpdateAccountRequestValidator : AbstractValidator<UpdateAccountRequest>
{
    public UpdateAccountRequestValidator()
    {
        RuleFor(x => x.AccountName).MustBeValidAccountName();
        RuleFor(x => x.Type).MustBeValidAccountType();
        RuleFor(x => x.Role).MustBeValidAccountRole();

        RuleFor(x => x.ReferenceNumber)
            .Must((r, n) => AccountClassificationHelper.ValidateReferenceNumber(r.Type, n))
            .When(x => AccountClassificationHelper.IsKnownAccountType(x.Type))
            .WithMessage(r => $"Invalid reference number {r.ReferenceNumber} for category {r.Type}.");
    }
}
