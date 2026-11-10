namespace AumoBackend.Extensions;

using System.Linq;
using AumoBackend.DTOs;
using AumoBackend.DTOs.Reports;

public static class JournalEntryMappingExtensions
{
    public static CreateGeneralJournalRequest ToServiceRequest(this CreateJournalEntryRequest request)
    {
        return new CreateGeneralJournalRequest
        {
            JournalType = request.JournalType,
            EntryDate = request.EntryDate,
            CreatedAt = request.CreatedAt,
            Lines = request.Lines?.Select(l => new CreateGeneralJournalLineRequest
            {
                AccountId = l.AccountId,
                LineDescription = l.LineDescription,
                Debit = l.Debit,
                Credit = l.Credit
            }).ToList() ?? new()
        };
    }

    public static UpdateGeneralJournalRequest ToServiceRequest(this UpdateJournalEntryRequest request)
    {
        return new UpdateGeneralJournalRequest
        {
            JournalType = request.JournalType,
            EntryDate = request.EntryDate,
            UpdatedAt = request.UpdatedAt,
            Lines = request.Lines?.Select(l => new CreateGeneralJournalLineRequest
            {
                AccountId = l.AccountId,
                LineDescription = l.LineDescription,
                Debit = l.Debit,
                Credit = l.Credit
            }).ToList() ?? new()
        };
    }
}
