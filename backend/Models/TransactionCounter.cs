using System;
using System.Collections.Generic;

namespace AumoBackend.Models;

public partial class TransactionCounter
{
    public int Id { get; set; }

    public Guid UserId { get; set; }

    public string CounterKey { get; set; } = null!;

    public int LastSequence { get; set; }
}
