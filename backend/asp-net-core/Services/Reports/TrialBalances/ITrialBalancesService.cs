// <copyright file="ITrialBalancesService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services;

public interface ITrialBalancesService
{
    Task<List<TrialBalanceUnadjustedRow>> BuildUnadjustedTrialBalanceAsync(AppDbContext db, Guid userId, Period period);

    Task<List<TrialBalanceAdjustedRow>> BuildAdjustedTrialBalanceAsync(AppDbContext db, Guid userId, Period period);

    Task<List<TrialBalancePostClosingRow>> BuildPostClosingTrialBalanceAsync(AppDbContext db, Guid userId, Period period);

    Task<decimal> ComputeRetainedEarningsEndingAsync(AppDbContext db, Guid userId, Period period);
}
