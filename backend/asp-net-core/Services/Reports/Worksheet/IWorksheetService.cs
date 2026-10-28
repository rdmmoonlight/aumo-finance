namespace AumoBackend.Services.Reports.Worksheet;

using AumoBackend.DTOs.Reports;

public interface IWorksheetService
{
    Task<WorksheetResponseDto> GetWorksheetAsync(Guid userId);
}