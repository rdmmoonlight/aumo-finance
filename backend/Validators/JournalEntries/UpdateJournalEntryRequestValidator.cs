using AumoBackend.DTOs;

namespace AumoBackend.Validators.JournalEntries;

public class UpdateJournalEntryRequestValidator : JournalEntryValidatorBase<UpdateJournalEntryRequest>
{
    public UpdateJournalEntryRequestValidator()
        : base(x => x.EntryDate, x => x.JournalType, x => x.Lines)
    {
    }
}
