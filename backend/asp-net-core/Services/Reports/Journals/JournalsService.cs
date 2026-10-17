// <copyright file="JournalsService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services;

using AumoBackend.Controllers.Reports;
using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
using AumoBackend.Models;
/// <summary>
/// Layanan logika bisnis untuk I Journal Service.
/// </summary>

public interface IJournalService
{
    Task<List<ClosingJournalEntryGroupApiResponse>> BuildClosingJournalGroupsAsync(AppDbContext db, Guid userId, Period period, IFinancialReportService reportService);
}
/// <summary>
/// Layanan logika bisnis untuk Journal Service.
/// </summary>

public class JournalService : IJournalService
{
    /// <summary>
    /// Proses eksekusi kalkulasi Build Closing Journal Groups Async.
    /// </summary>
    public async Task<List<ClosingJournalEntryGroupApiResponse>> BuildClosingJournalGroupsAsync(AppDbContext db, Guid userId, Period period, IFinancialReportService reportService)
    {
        var rows = await TrialBalanceController.BuildTrialBalanceRowsAsync(db, userId, period, true);
        var incomeStatement = reportService.BuildIncomeStatement(rows, period);
        var reAccountName = rows.Find(r => r.Role == "RetainedEarnings")?.AccountName ?? "Retained Earnings";
        const string incomeSummaryName = "Income Summary";

        var groups = new List<ClosingJournalEntryGroupApiResponse>();

        var incomeRows = rows.Where(r => r.Type == "OperatingIncome" || r.Type == "OtherIncome").Where(r => r.NetBalance != 0).ToList();
        var expenseRows = rows.Where(r => r.Type == "OperatingExpenses" || r.Type == "OtherExpenses").Where(r => r.NetBalance != 0).ToList();

        // BLOCK 1: Closing Revenues to Income Summary
        if (incomeRows.Count > 0)
        {
            var group1 = new ClosingJournalEntryGroupApiResponse { Description = "Closing Revenue Accounts to Income Summary" };
            foreach (var r in incomeRows)
            {
                group1.Lines.Add(new ClosingJournalLineApiResponse
                {
                    ReferenceNumber = r.ReferenceNumber ?? "0",
                    AccountName = r.AccountName,
                    Debit = r.NetBalance,
                    Credit = 0m,
                });
            }

            group1.Lines.Add(new ClosingJournalLineApiResponse
            {
                ReferenceNumber = "0",
                AccountName = incomeSummaryName,
                Debit = 0m,
                Credit = incomeRows.Sum(r => r.NetBalance),
            });
            groups.Add(group1);
        }

        // BLOCK 2: Closing Expenses to Income Summary
        if (expenseRows.Count > 0)
        {
            var group2 = new ClosingJournalEntryGroupApiResponse { Description = "Closing Expense Accounts to Income Summary" };
            group2.Lines.Add(new ClosingJournalLineApiResponse
            {
                ReferenceNumber = "0",
                AccountName = incomeSummaryName,
                Debit = expenseRows.Sum(r => r.NetBalance),
                Credit = 0m,
            });
            foreach (var r in expenseRows)
            {
                group2.Lines.Add(new ClosingJournalLineApiResponse
                {
                    ReferenceNumber = r.ReferenceNumber ?? "0",
                    AccountName = r.AccountName,
                    Debit = 0m,
                    Credit = r.NetBalance,
                });
            }

            groups.Add(group2);
        }

        // BLOCK 3: Closing Income Summary to Retained Earnings
        if (incomeStatement.NetIncome != 0)
        {
            var group3 = new ClosingJournalEntryGroupApiResponse { Description = "Closing Income Summary to Retained Earnings" };

            if (incomeStatement.NetIncome > 0)
            {
                group3.Lines.Add(new ClosingJournalLineApiResponse
                {
                    ReferenceNumber = "0",
                    AccountName = incomeSummaryName,
                    Debit = incomeStatement.NetIncome,
                    Credit = 0m,
                });
                group3.Lines.Add(new ClosingJournalLineApiResponse
                {
                    ReferenceNumber = "0",
                    AccountName = reAccountName,
                    Debit = 0m,
                    Credit = incomeStatement.NetIncome,
                });
            }
            else
            {
                var netLoss = Math.Abs(incomeStatement.NetIncome);
                group3.Lines.Add(new ClosingJournalLineApiResponse
                {
                    ReferenceNumber = "0",
                    AccountName = reAccountName,
                    Debit = netLoss,
                    Credit = 0m,
                });
                group3.Lines.Add(new ClosingJournalLineApiResponse
                {
                    ReferenceNumber = "0",
                    AccountName = incomeSummaryName,
                    Debit = 0m,
                    Credit = netLoss,
                });
            }

            groups.Add(group3);
        }

        return groups;
    }
}