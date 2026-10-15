using AumoBackend.DTOs;

namespace AumoBackend.Validators.JournalEntries;

public class CreateJournalEntryRequestValidator : JournalEntryValidatorBase<CreateJournalEntryRequest>
{
    public CreateJournalEntryRequestValidator()
        : base(x => x.EntryDate, x => x.JournalType, x => x.Lines)
    {
    }
}
