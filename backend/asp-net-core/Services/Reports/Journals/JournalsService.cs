using AumoBackend.Services.Reports.TrialBalances;

namespace AumoBackend.Services.Reports.Journals;

public class JournalsService : IJournalsService
{
    private readonly ITrialBalancesService _trialBalancesService;

    public JournalsService(ITrialBalancesService trialBalancesService)
    {
        _trialBalancesService = trialBalancesService;
    }

    public async Task<List<ClosingJournalEntryGroupApiResponse>> BuildClosingJournalGroupsAsync(
        Guid userId,
        Period period)
    {
        var rows = await _trialBalancesService.BuildTrialBalancesRowsAsync(userId, period, true);
        var reAccountName = rows.Find(r => r.Role == "RetainedEarnings")?.AccountName ?? "Retained Earnings";
        const string incomeSummaryName = "Income Summary";

        var groups = new List<ClosingJournalEntryGroupApiResponse>();

        var incomeRows = rows
            .Where(r => r.Type == "OperatingIncome" || r.Type == "OtherIncome")
            .Where(r => r.NetBalance != 0)
            .ToList();

        var expenseRows = rows
            .Where(r => r.Type == "OperatingExpenses" || r.Type == "OtherExpenses")
            .Where(r => r.NetBalance != 0)
            .ToList();

        var totalIncome = incomeRows.Sum(r => r.NetBalance);
        var totalExpenses = expenseRows.Sum(r => r.NetBalance);

        // BLOCK 1: Closing Revenues to Income Summary
        if (incomeRows.Count > 0)
        {
            var group1 = new ClosingJournalEntryGroupApiResponse
            {
                Description = "Closing Revenue Accounts to Income Summary"
            };

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
                Credit = totalIncome,
            });

            groups.Add(group1);
        }

        // BLOCK 2: Closing Expenses to Income Summary
        if (expenseRows.Count > 0)
        {
            var group2 = new ClosingJournalEntryGroupApiResponse
            {
                Description = "Closing Expense Accounts to Income Summary"
            };

            group2.Lines.Add(new ClosingJournalLineApiResponse
            {
                ReferenceNumber = "0",
                AccountName = incomeSummaryName,
                Debit = totalExpenses,
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
        var netIncome = totalIncome - totalExpenses;

        if (netIncome != 0)
        {
            var group3 = new ClosingJournalEntryGroupApiResponse
            {
                Description = "Closing Income Summary to Retained Earnings"
            };

            if (netIncome > 0)
            {
                group3.Lines.Add(new ClosingJournalLineApiResponse
                {
                    ReferenceNumber = "0",
                    AccountName = incomeSummaryName,
                    Debit = netIncome,
                    Credit = 0m,
                });
                group3.Lines.Add(new ClosingJournalLineApiResponse
                {
                    ReferenceNumber = "0",
                    AccountName = reAccountName,
                    Debit = 0m,
                    Credit = netIncome,
                });
            }
            else
            {
                var netLoss = Math.Abs(netIncome);
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