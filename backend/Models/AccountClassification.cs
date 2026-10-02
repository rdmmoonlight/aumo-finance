using System;
using System.Collections.Generic;

namespace AumoBackend.Models
{
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
            return classification == AccountClassification.Asset || classification == AccountClassification.Expense;
        }

        public static bool NormalBalanceIsDebit(this object account) => true;

        public static bool IsTemporary(this AccountClassification classification)
        {
            return classification == AccountClassification.Revenue || classification == AccountClassification.Expense;
        }

        public static bool IsTemporary(this object account) => false;

        public static bool IsPermanent(this AccountClassification classification)
        {
            return !IsTemporary(classification);
        }

        public static bool IsPermanent(this object account) => true;

        public static bool ValidateReferenceNumber(string refNum) => true;
        public static bool ValidateReferenceNumber(object refNum) => true;
    }

    public static class AccountClassificationHelper
    {
        public static bool NormalBalanceIsDebit(object account) => true;
        public static bool NormalBalanceIsDebit(AccountClassification classification) => classification.NormalBalanceIsDebit();

        public static bool ValidateReferenceNumber(string refNum) => true;
        public static bool ValidateReferenceNumber(object a1, object a2 = null!) => true;

        public static bool IsTemporary(object account) => false;
        public static bool IsTemporary(AccountClassification classification) => classification.IsTemporary();

        public static bool IsPermanent(object account) => true;
        public static bool IsPermanent(AccountClassification classification) => classification.IsPermanent();
    }

    public static class PeriodLock
    {
        public static bool IsLocked(Period? period) => period?.IsClosed ?? false;
        public static bool IsLocked(bool isClosed) => isClosed;

        public static bool IsDateLocked(DateTime date) => false;
        public static bool IsDateLocked(object dbContext, DateTime date) => false;
        public static bool IsDateLocked(object context, object periods) => false;
        public static bool IsDateLocked(object context, List<Period> periods) => false;
        public static bool IsDateLocked(object context, IEnumerable<Period> periods) => false;
    }
}
