using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using System;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Periods;

public interface IPeriodsService
{
    Task<GetPeriodsResponse> GetPeriodsAsync(Guid userId);
    Task<OpenPeriodInfoResponse> GetOpenPeriodInfoAsync(Guid userId);
    Task<CreatePeriodResult> CreatePeriodAsync(Guid userId, CreatePeriodRequest request);
    Task<SelectPeriodResult?> SelectPeriodAsync(Guid userId, int periodId);
    Task<BaseServiceResult> ClearSelectionAsync(Guid userId);
    Task<BaseServiceResult> ClosePeriodAsync(Guid userId, int periodId);
}
