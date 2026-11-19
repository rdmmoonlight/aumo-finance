namespace AumoBackend.Models
{
    using AumoBackend.Domain;

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

        // Saldo normal: aturan ada di AumoBackend.Domain.AccountType.
        public static bool NormalBalanceIsDebit(string? accountType)
            => AccountType.IsDebitNormal(accountType);

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

        // Akun temporer = akun laba rugi; akun permanen = akun posisi keuangan (lihat AccountType di Domain).
        internal static bool IsTemporary(string type)
        {
            return AccountType.IsTemporary(type);
        }

        // Perilaku lama dipertahankan: apa pun yang bukan akun temporer dianggap permanen.
        internal static bool IsPermanent(string type)
        {
            return !AccountType.IsTemporary(type);
        }

        public static IReadOnlyCollection<string> AccountTypes => AccountType.All;

        public static readonly string[] AccountRoles = { "Default", "CashAndEquivalents", "RetainedEarnings" };

        public static bool IsKnownAccountType(string? type)
            => AccountType.IsKnown(type);

        internal static bool ValidateReferenceNumber(string type, int referenceNumber)
        {
            return AccountType.IsReferenceNumberValid(type, referenceNumber);
        }
    }
}
