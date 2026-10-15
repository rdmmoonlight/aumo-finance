using System;
using System.Collections.Generic;

namespace AumoBackend.Models;

public partial class ChartOfAccount
{
    public int Id { get; set; }

    public int ReferenceNumber { get; set; }

    public string AccountName { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string Role { get; set; } = null!;

    public bool IsActive { get; set; }

    public Guid UserId { get; set; }

    public virtual ICollection<GeneralJournal> GeneralJournals { get; set; } = new List<GeneralJournal>();

    public virtual ICollection<GeneralLedgerPermanentAccount> GeneralLedgerPermanentAccounts { get; set; } = new List<GeneralLedgerPermanentAccount>();

    public virtual ICollection<GeneralLedgerTemporaryAccount> GeneralLedgerTemporaryAccounts { get; set; } = new List<GeneralLedgerTemporaryAccount>();
}
