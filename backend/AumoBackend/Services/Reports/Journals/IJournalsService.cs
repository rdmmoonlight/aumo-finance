namespace AumoBackend.Services.Reports.Journals;

using AumoBackend.DTOs.Reports;
using AumoBackend.Models;

public interface IJournalsService
{
    /// <summary>Jurnal tersimpan untuk periode terpilih. journalType: "General", "Adjusting", "Reversing", atau "Closing".</summary>
    Task<JournalReportResult> GetJournalAsync(Guid userId, string journalType);

    /// <summary>
    /// Membuat jurnal pembalik (Reversing) pada hari pertama periode terpilih dari jurnal penyesuaian
    /// periode sebelumnya: Debit dan Kredit setiap baris ditukar. Satu jurnal sumber hanya dapat dibalik
    /// sekali. Melempar KeyNotFoundException jika jurnal sumber tidak ada dan DomainRuleViolation
    /// (turunan InvalidOperationException) jika periode tidak dipilih/sudah ditutup, tanggal sumber tidak valid, atau sudah pernah dibalik.
    /// </summary>
    Task<List<GeneralJournalResponseDto>> CreateReversingAsync(Guid userId, CreateReversingRequest request);

    /// <summary>
    /// Jurnal penutup periode terpilih. Dihitung on-the-fly dari GeneralJournals (tidak pernah disimpan).
    /// </summary>
    Task<ClosingJournalReportResult> GetClosingJournalAsync(Guid userId);

    Task<List<ClosingJournalEntryGroupApiResponse>> BuildClosingJournalGroupsAsync(Guid userId, Period period);
}
