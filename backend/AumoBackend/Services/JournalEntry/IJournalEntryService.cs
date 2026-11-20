namespace AumoBackend.Services.JournalEntry;

public interface IJournalEntryService
{
    Task<GeneralJournalResponseDto?> GetByIdAsync(Guid userId, int id);
    Task<List<GeneralJournalResponseDto>> GetByTransactionNumberAsync(Guid userId, string transactionNumber);
    Task<GeneralJournalResponseDto> CreateAsync(Guid userId, CreateGeneralJournalRequest request);
    Task<List<string>> SearchLineDescriptionsAsync(Guid userId, string query);
    Task<string> GetNextTransactionNumberAsync(Guid userId, string journalType, DateTime? entryDate);
}
