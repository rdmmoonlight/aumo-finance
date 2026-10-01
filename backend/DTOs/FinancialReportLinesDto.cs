using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;

namespace AumoBackend.DTOs
{
    public class CashFlowLine
    {
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class IncomeStatementLine
    {
        public string AccountName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class FinancialPositionLine
    {
        public string AccountName { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public decimal Amount { get; set; }
    }
}
