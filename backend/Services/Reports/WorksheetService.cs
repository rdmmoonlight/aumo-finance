using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs.Reports;
using AumoBackend.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using Microsoft.EntityFrameworkCore;

using AumoBackend.Models;

namespace AumoBackend.Services;

public interface IWorksheetService
{
    Task<List<WorksheetRowApiResponse>> BuildWorksheetRowsAsync(
        AppDbContext db,
        Guid userId,
        Period period,
        ITrialBalanceService trialBalanceService);
}

public class WorksheetService : IWorksheetService
{
    public async Task<List<WorksheetRowApiResponse>> BuildWorksheetRowsAsync(
        AppDbContext db,
        Guid userId,
        Period period,
        ITrialBalanceService trialBalanceService)
    {
        var unadjusted = await trialBalanceService.BuildTrialBalanceRowsAsync(db, userId, period, includeAdjusting: false);
        var adjusted = await trialBalanceService.BuildTrialBalanceRowsAsync(db, userId, period, includeAdjusting: true);

        var accounts = await db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .OrderBy(a => a.ReferenceNumber)
            .ToListAsync();

        var worksheetRows = new List<WorksheetRowApiResponse>();
        var allAccountIds = unadjusted.Select(r => r.AccountId)
            .Union(adjusted.Select(r => r.AccountId))
            .ToList();

        foreach (var accountId in allAccountIds)
        {
            var account = accounts.FirstOrDefault(a => a.Id == accountId);
            if (account == null) continue;

            var u = unadjusted.FirstOrDefault(r => r.AccountId == accountId);
            var a = adjusted.FirstOrDefault(r => r.AccountId == accountId);
            var normalDebit = AccountClassificationHelper.NormalBalanceIsDebit(account.Type);

            var uDebit = u?.Debit ?? 0m;
            var uCredit = u?.Credit ?? 0m;
            var aDebit = a?.Debit ?? 0m;
            var aCredit = a?.Credit ?? 0m;

            var adjNet = (aDebit - aCredit) - (uDebit - uCredit);

            var row = new WorksheetRowApiResponse
            {
                AccountId = accountId,
                ReferenceNumber = account.ReferenceNumber,
                AccountName = account.AccountName,
                Type = account.Type,
                NormalBalanceIsDebit = normalDebit,
                UnadjustedDebit = uDebit,
                UnadjustedCredit = uCredit,
                AdjustmentDebit = adjNet > 0 ? adjNet : 0m,
                AdjustmentCredit = adjNet < 0 ? -adjNet : 0m,
                AdjustedDebit = aDebit,
                AdjustedCredit = aCredit
            };

            var isTemporary = AccountClassificationHelper.IsTemporary(account.Type);
            if (isTemporary)
            {
                row.IncomeStatementDebit = aDebit;
                row.IncomeStatementCredit = aCredit;
            }
            else
            {
                row.FinancialPositionDebit = aDebit;
                row.FinancialPositionCredit = aCredit;
            }

            worksheetRows.Add(row);
        }

        return worksheetRows.OrderBy(r => r.ReferenceNumber).ToList();
    }
}
