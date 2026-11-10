namespace AumoBackend.Validators.Common;

using System.Linq;
using FluentValidation.Results;

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
            errors = errors,
        };
    }
}
