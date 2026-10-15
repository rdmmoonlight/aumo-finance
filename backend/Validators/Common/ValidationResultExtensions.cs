using FluentValidation.Results;

namespace AumoBackend.Validators.Common;

/// <summary>
/// Format respons error validasi yang seragam untuk seluruh endpoint.
/// `message` berisi error pertama (frontend menampilkan error.data.message),
/// `errors` berisi seluruh error.
/// </summary>
public static class ValidationResultExtensions
{
    public static object ToErrorResponse(this ValidationResult result)
    {
        var errors = result.Errors
            .Select(e => e.ErrorMessage)
            .Distinct()
            .ToArray();

        return new
        {
            success = false,
            message = errors.FirstOrDefault() ?? "Validation failed.",
            errors
        };
    }
}
