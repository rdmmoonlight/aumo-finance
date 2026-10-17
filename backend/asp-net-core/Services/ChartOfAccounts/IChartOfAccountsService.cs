// <copyright file="IChartOfAccountsService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.ChartOfAccounts;

using AumoBackend.DTOs;

/// <summary>
/// Layanan logika bisnis untuk I Chart Of Accounts Service.
/// </summary>
public interface IChartOfAccountsService
{
    Task<ChartOfAccountsListResponseDto> GetAccountsAsync(Guid userId, string? search, string? category);

    Task<ServiceResultDto> CreateAccountAsync(Guid userId, CreateAccountRequestDto request);

    Task<ServiceResultDto> UpdateAccountAsync(Guid userId, int accountId, UpdateAccountRequestDto request);

    Task<ServiceResultDto> DeleteAccountAsync(Guid userId, int accountId);
}
