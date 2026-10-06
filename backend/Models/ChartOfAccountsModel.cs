using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AumoBackend.Models
{
    public class ChartOfAccount
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Reference number is required.")]
        public int ReferenceNumber { get; set; }

        public Guid UserId { get; set; }

        [Required(ErrorMessage = "Account name is required.")]
        [StringLength(100)]
        public string AccountName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Account type is required.")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "System role is required.")]
        public string Role { get; set; } = string.Empty;

        [NotMapped]
        public decimal Balance { get; set; }

        public bool IsActive { get; set; } = true;

        [NotMapped]
        public string DisplayLabel => $"{ReferenceNumber} - {AccountName}";
    }

    public enum AccountClassification
    {
        Asset,
        Liability,
        Equity,
        Revenue,
        Expense
    }

    public static class AccountClassificationExtensions
    {
        public static bool NormalBalanceIsDebit(this AccountClassification classification)
        {
            return classification == AccountClassification.Asset
                || classification == AccountClassification.Expense;
        }

        public static bool IsTemporary(this AccountClassification classification)
        {
            return classification == AccountClassification.Revenue
                || classification == AccountClassification.Expense;
        }

        public static bool IsPermanent(this AccountClassification classification)
        {
            return !IsTemporary(classification);
        }
    }

    public static class AccountClassificationHelper
    {
        public static bool NormalBalanceIsDebit(AccountClassification classification)
            => classification.NormalBalanceIsDebit();

        // Saldo Normal:
        // Debit  : Assets, OperatingExpenses, OtherExpenses
        // Kredit : Liabilities, Equity, OperatingIncome, OtherIncome
        public static bool NormalBalanceIsDebit(string? accountType)
        {
            return accountType switch
            {
                "Assets" or "OperatingExpenses" or "OtherExpenses" => true,
                "Liabilities" or "Equity" or "OperatingIncome" or "OtherIncome" => false,
                _ => true // Default fallback jika tipe tidak dikenali
            };
        }

        public static bool IsTemporary(AccountClassification classification)
            => classification.IsTemporary();

        public static bool IsPermanent(AccountClassification classification)
            => classification.IsPermanent();

        public static bool ValidateReferenceNumber(string? refNum)
        {
            if (string.IsNullOrWhiteSpace(refNum)) return false;
            return int.TryParse(refNum, out _);
        }

        internal static bool ValidateReferenceNumber(AccountClassification classification)
        {
            throw new NotImplementedException();
        }

        internal static bool IsTemporary(string type)
        {
            throw new NotImplementedException();
        }

        internal static bool IsPermanent(string type)
        {
            throw new NotImplementedException();
        }

        internal static bool ValidateReferenceNumber(string type, int referenceNumber)
        {
            throw new NotImplementedException();
        }
    }

    public static class PeriodLock
    {
        public static bool IsLocked(Period? period) => period?.IsClosed ?? false;
        public static bool IsLocked(bool isClosed) => isClosed;

        public static bool IsDateLocked(DateTime date, IEnumerable<Period>? periods)
        {
            if (periods == null) return false;

            // Memeriksa apakah tanggal masuk dalam rentang periode yang sudah ditutup (IsClosed = true)
            foreach (var period in periods)
            {
                if (period.IsClosed && date >= period.StartDate && date <= period.EndDate)
                {
                    return true;
                }
            }

            return false;
        }
    }
}