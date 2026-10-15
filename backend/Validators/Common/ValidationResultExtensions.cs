using FluentValidation.Results;

namespace AumoBackend.Validators.Common;

/// <summary>
/// Format respons error validasi yang seragam untuk seluruh endpoint.
/// Bentuk JSON sama dengan respons Login sebelumnya, sehingga frontend/mobile tidak perlu berubah.
/// </summary>
public static class ValidationResultExtensions
{
    public static object ToErrorResponse(this ValidationResult result) => new
    {
        success = false,
        message = "Validation failed.",
        errors = result.Errors
            .Select(e => e.ErrorMessage)
            .Distinct()
            .ToArray()
    };
}
