namespace AumoBackend.Validators.Queries;

using AumoBackend.DTOs;
using FluentValidation;

public class SearchDescriptionsQueryValidator : AbstractValidator<SearchDescriptionsQuery>
{
    private const int MaxKeywordLength = 100;

    public SearchDescriptionsQueryValidator()
    {
        this.RuleFor(x => x.Q)
            .MaximumLength(MaxKeywordLength)
            .WithMessage($"Search keyword must not exceed {MaxKeywordLength} characters.");
    }
}
