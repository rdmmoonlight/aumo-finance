// <copyright file="GetDashboardQueryValidator.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Validators.Queries;

using AumoBackend.DTOs;
using FluentValidation;
/// <summary>
/// Validator untuk Get Dashboard Query Validator.
/// </summary>

public class GetDashboardQueryValidator : AbstractValidator<GetDashboardQuery>
{
    /// <summary>
    /// Validator untuk Get Dashboard Query Validator.
    /// </summary>
    public GetDashboardQueryValidator()
    {
        this.RuleFor(x => x.Period)
            .Must(p => string.IsNullOrWhiteSpace(p)
                || p.Equals("monthly", StringComparison.OrdinalIgnoreCase)
                || p.Equals("annual", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Period must be 'monthly' or 'annual'.");
    }
}
