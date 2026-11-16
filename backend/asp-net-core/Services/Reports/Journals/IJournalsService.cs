namespace AumoBackend.Services.Reports.Journals;

using AumoBackend.DTOs.Reports;
using AumoBackend.Models;

public interface IJournalsService
{
    /// <summary>Jurnal tersimpan untuk periode terpilih. journalType: "General", "Adjusting", atau "Closing".</summary>
    Task<JournalReportResult> GetJournalAsync(Guid userId, string journalType);

    /// <summary>
    /// Jurnal penutup periode terpilih. Dihitung on-the-fly dari GeneralJournals (tidak pernah disimpan).
    /// </summary>
    Task<ClosingJournalReportResult> GetClosingJournalAsync(Guid userId);

    Task<List<ClosingJournalEntryGroupApiResponse>> BuildClosingJournalGroupsAsync(Guid userId, Period period);
}
