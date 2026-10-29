namespace AumoBackend.Services.Reports.Journals;

public interface IJournalsService
{
    Task<List<ClosingJournalEntryGroupApiResponse>> BuildClosingJournalGroupsAsync(
        Guid userId,
        Period period);
}