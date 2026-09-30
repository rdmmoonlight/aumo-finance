using FluentValidation;
using AumoBackend.Core;

namespace AumoBackend.Validators
{
    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            // 1. Validasi Email / Username
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email or username is required.")
                .MaximumLength(256).WithMessage("Email or username must not exceed 256 characters.");

            // 2. Validasi Password
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.")
                .MaximumLength(128).WithMessage("Password must not exceed 128 characters.");

            // 3. Validasi UserAgent Optional
            When(x => !string.IsNullOrWhiteSpace(x.UserAgent), () =>
            {
                RuleFor(x => x.UserAgent)
                    .MaximumLength(512).WithMessage("UserAgent payload is too long.");
            });

            // 4. Validasi OperatingSystem Optional
            When(x => !string.IsNullOrWhiteSpace(x.OperatingSystem), () =>
            {
                RuleFor(x => x.OperatingSystem)
                    .MaximumLength(100).WithMessage("Operating system identifier is too long.");
            });
        }
    }
}