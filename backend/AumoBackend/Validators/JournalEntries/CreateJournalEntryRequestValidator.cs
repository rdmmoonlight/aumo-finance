namespace AumoBackend.Validators.JournalEntries;

using AumoBackend.DTOs;

public class CreateJournalEntryRequestValidator : JournalEntryValidatorBase<CreateJournalEntryRequest>
{
    public CreateJournalEntryRequestValidator()
        : base(x => x.EntryDate, x => x.JournalType, x => x.Lines)
    {
    }
}
