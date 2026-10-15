using AumoBackend.DTOs;
using FluentValidation;

namespace AumoBackend.Validators.Auth;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    // Selaras dengan aturan Identity di Program.cs (RequiredLength = 6).
    private const int MinPasswordLength = 6;
    private const int MaxPasswordLength = 128;

    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.")
            .MaximumLength(MaxPasswordLength).WithMessage("Current password must not exceed 128 characters.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(MinPasswordLength).WithMessage("New password must be at least 6 characters.")
            .MaximumLength(MaxPasswordLength).WithMessage("New password must not exceed 128 characters.")
            .NotEqual(x => x.CurrentPassword).WithMessage("New password must be different from the current password.")
            .When(x => !string.IsNullOrEmpty(x.NewPassword));
    }
}
