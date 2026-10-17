// <copyright file="ChartOfAccountsModel.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models
{
    public enum AccountClassification
    {
        Asset,
        Liability,
        Equity,
        Revenue,
        Expense,
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
                _ => true, // Default fallback jika tipe tidak dikenali
            };
        }

        public static bool IsTemporary(AccountClassification classification)
            => classification.IsTemporary();

        public static bool IsPermanent(AccountClassification classification)
            => classification.IsPermanent();

        public static bool ValidateReferenceNumber(string? refNum)
        {
            if (string.IsNullOrWhiteSpace(refNum))
            {
                return false;
            }

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

        public static IReadOnlyCollection<string> AccountTypes => ReferenceRanges.Keys;

        // Role akun yang dikenal sistem (dipakai Periods, laporan keuangan)
        public static readonly string[] AccountRoles = { "Default", "CashAndEquivalents", "RetainedEarnings" };

        public static bool IsKnownAccountType(string? type)
            => type != null && ReferenceRanges.ContainsKey(type);

        internal static bool ValidateReferenceNumber(string type, int referenceNumber)
        {
            return ReferenceRanges.TryGetValue(type ?? string.Empty, out var range)
                && referenceNumber >= range.Start
                && referenceNumber <= range.End;
        }
    }

    public static class PeriodLock
    {
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

        public static bool IsLocked(bool isClosed) => isClosed;

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