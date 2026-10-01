using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs.Reports;
using AumoBackend.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AumoBackend.ViewModels.Reports;

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
    public decimal TotalDebit => Rows.Sum(r => r.Debit);
    public decimal TotalCredit => Rows.Sum(r => r.Credit);
    public bool IsBalanced => Math.Round(TotalDebit - TotalCredit, 2) == 0;
}
