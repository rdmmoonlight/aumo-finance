using System;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.GeneralLedgers;

public interface IGeneralLedgerService
{
    Task<BaseServiceResult> RefreshGeneralLedgersAsync(Guid userId);
    Task<BaseServiceResult> ClearSelectedPeriodLedgersAsync(Guid userId);
}
