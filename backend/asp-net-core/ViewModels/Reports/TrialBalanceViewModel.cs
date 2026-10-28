// <copyright file="TrialBalanceViewModel.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.ViewModels.Reports;

using System;
using System.Collections.Generic;
using System.Linq;

public class TrialBalanceRow
{
    public int AccountId { get; set; }

    public string? ReferenceNumber { get; set; }

    public string AccountName { get; set; } = string.Empty;

    public string? Type { get; set; }

    public string? Role { get; set; }

    public bool NormalBalanceIsDebit { get; set; }

    public decimal NetBalance { get; set; }

    public decimal Debit { get; set; }

    public decimal Credit { get; set; }
}

public class TrialBalanceViewModel
{
    public string Title { get; set; } = string.Empty;

    public List<TrialBalanceRow> Rows { get; set; } = new();

    public decimal TotalDebit => this.Rows.Sum(r => r.Debit);

    public decimal TotalCredit => this.Rows.Sum(r => r.Credit);

    public bool IsBalanced => Math.Round(this.TotalDebit - this.TotalCredit, 2) == 0;
}
