using AumoBackend.DTOs.Core;
using FluentValidation;

namespace AumoBackend.Validators.Core;

/// <summary>
/// Validator untuk Salam Request Validator.
/// </summary>
public class SalamRequestValidator : AbstractValidator<SalamRequestDto>
{
    /// <summary>
    /// Validator untuk Salam Request Validator.
    /// </summary>
    public SalamRequestValidator()
    {
        RuleFor(x => x.ClientName)
            .NotEmpty()
            .WithMessage("Nama client tidak boleh kosong.")
            .MaximumLength(50)
            .WithMessage("Nama client maksimal 50 karakter.")
            .Matches(@"^[a-zA-Z0-9\s_-]+$")
            .WithMessage("Nama client hanya boleh berisi huruf, angka, spasi, strip, atau underscore.");
    }
}
