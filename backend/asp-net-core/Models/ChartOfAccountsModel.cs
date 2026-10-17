// <copyright file="ChartOfAccountsModel.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models
{
    /// <summary>
    /// Mewakili Account Classification.
    /// </summary>
    public enum AccountClassification
    {
        /// <summary>
        /// Mewakili Asset.
        /// </summary>
        Asset,
        /// <summary>
        /// Mewakili Liability.
        /// </summary>
        Liability,
        /// <summary>
        /// Mewakili Equity.
        /// </summary>
        Equity,
        /// <summary>
        /// Mewakili Revenue.
        /// </summary>
        Revenue,
        /// <summary>
        /// Mewakili Expense.
        /// </summary>
        Expense,
    }
/// <summary>
/// Mewakili Account Classification Extensions.
/// </summary>

    public static class AccountClassificationExtensions
    {
        /// <summary>
        /// Mewakili Normal Balance Is Debit.
        /// </summary>
        public static bool NormalBalanceIsDebit(this AccountClassification classification)
        {
            return classification == AccountClassification.Asset
                || classification == AccountClassification.Expense;
        }
/// <summary>
/// Mewakili Is Temporary.
/// </summary>

        public static bool IsTemporary(this AccountClassification classification)
        {
            return classification == AccountClassification.Revenue
                || classification == AccountClassification.Expense;
        }
/// <summary>
/// Mewakili Is Permanent.
/// </summary>

        public static bool IsPermanent(this AccountClassification classification)
        {
            return !IsTemporary(classification);
        }
    }
/// <summary>
/// Mewakili Account Classification Helper.
/// </summary>

    public static class AccountClassificationHelper
    {
        /// <summary>
        /// Mewakili Normal Balance Is Debit.
        /// </summary>
        public static bool NormalBalanceIsDebit(AccountClassification classification)
            => classification.NormalBalanceIsDebit();
/// <summary>
/// Mewakili Normal Balance Is Debit.
/// </summary>

        // Saldo Normal:
        // Debit  : Assets, OperatingExpenses, OtherExpenses
        // Kredit : Liabilities, Equity, OperatingIncome, OtherIncome
        public static bool NormalBalanceIsDebit(string? accountType)
        {
            return accountType switch
            {
                "Assets" or "OperatingExpenses" or "OtherExpenses" => true,
                "Liabilities" or "Equity" or "OperatingIncome" or "OtherIncome" => false,
                _ => true, // Default fallback jika tipe tidak dikenali
            };
        }
/// <summary>
/// Mewakili Is Temporary.
/// </summary>

        public static bool IsTemporary(AccountClassification classification)
            => classification.IsTemporary();
/// <summary>
/// Mewakili Is Permanent.
/// </summary>

        public static bool IsPermanent(AccountClassification classification)
            => classification.IsPermanent();
/// <summary>
/// Mewakili Validate Reference Number.
/// </summary>

        public static bool ValidateReferenceNumber(string? refNum)
        {
            if (string.IsNullOrWhiteSpace(refNum))
            {
                return false;
            }

            return int.TryParse(refNum, out _);
        }
/// <summary>
/// Mewakili Validate Reference Number.
/// </summary>

        internal static bool ValidateReferenceNumber(AccountClassification classification)
        {
            throw new NotImplementedException();
        }
/// <summary>
/// Mewakili Is Temporary.
/// </summary>

        internal static bool IsTemporary(string type)
        {
            throw new NotImplementedException();
        }
/// <summary>
/// Mewakili Is Permanent.
/// </summary>

        internal static bool IsPermanent(string type)
        {
            throw new NotImplementedException();
        }

        // Rentang kode akun per kategori (selaras ACCOUNT_RANGES di frontend/coa-types.ts)
        private static readonly Dictionary<string, (int Start, int End)> ReferenceRanges = new()
        {
            ["Assets"] = (100, 199),
            ["Liabilities"] = (200, 299),
            ["Equity"] = (300, 399),
            ["OperatingIncome"] = (400, 499),
            ["OperatingExpenses"] = (500, 599),
            ["OtherIncome"] = (600, 799),
            ["OtherExpenses"] = (800, 999),
        };
/// <summary>
/// Mewakili Account Types.
/// </summary>

        public static IReadOnlyCollection<string> AccountTypes => ReferenceRanges.Keys;
/// <summary>
/// Mewakili Account Roles.
/// </summary>

        // Role akun yang dikenal sistem (dipakai Periods, laporan keuangan)
        public static readonly string[] AccountRoles = { "Default", "CashAndEquivalents", "RetainedEarnings" };
/// <summary>
/// Mewakili Is Known Account Type.
/// </summary>

        public static bool IsKnownAccountType(string? type)
            => type != null && ReferenceRanges.ContainsKey(type);
/// <summary>
/// Mewakili Validate Reference Number.
/// </summary>

        internal static bool ValidateReferenceNumber(string type, int referenceNumber)
        {
            return ReferenceRanges.TryGetValue(type ?? string.Empty, out var range)
                && referenceNumber >= range.Start
                && referenceNumber <= range.End;
        }
    }
/// <summary>
/// Mewakili Period Lock.
/// </summary>

    public static class PeriodLock
    {
        /// <summary>
        /// Mewakili Is Locked.
        /// </summary>
        public static bool IsLocked(Period? period)
        {
            if (period == null)
            {
                return false;
            }

            return period.GetType().GetProperties()
                .FirstOrDefault(property => property.Name == "IsClosed")?
                .GetValue(period) is true;
        }
/// <summary>
/// Mewakili Is Locked.
/// </summary>

        public static bool IsLocked(bool isClosed) => isClosed;
/// <summary>
/// Mewakili Is Date Locked.
/// </summary>

        public static bool IsDateLocked(DateTime date, IEnumerable<Period>? periods)
        {
            if (periods == null)
            {
                return false;
            }

            // Memeriksa apakah tanggal masuk dalam rentang periode yang sudah ditutup (IsClosed = true)
            foreach (var period in periods)
            {
                var properties = period?.GetType().GetProperties();
                var startDate = properties?
                    .FirstOrDefault(property => property.Name == "StartDate")?
                    .GetValue(period);
                var endDate = properties?
                    .FirstOrDefault(property => property.Name == "EndDate")?
                    .GetValue(period);

                if (IsLocked(period)
                    && startDate is DateTime start
                    && endDate is DateTime end
                    && date >= start
                    && date <= end)
                {
                    return true;
                }
            }

            return false;
        }
    }
}