// <copyright file="ITrialBalancesService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
using AumoBackend.Models;

namespace AumoBackend.Services;

public interface ITrialBalancesService
{
    Task<List<TrialBalanceUnadjustedRow>> BuildUnadjustedTrialBalanceAsync(AppDbContext db, Guid userId, Period period);

    Task<List<TrialBalanceAdjustedRow>> BuildAdjustedTrialBalanceAsync(AppDbContext db, Guid userId, Period period);

    Task<List<TrialBalancePostClosingRow>> BuildPostClosingTrialBalanceAsync(AppDbContext db, Guid userId, Period period);

    Task<decimal> ComputeRetainedEarningsEndingAsync(AppDbContext db, Guid userId, Period period);
}
