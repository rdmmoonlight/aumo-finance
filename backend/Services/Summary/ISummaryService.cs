using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Summary;

public interface ISummaryService
{
    Task<SummaryDto?> GetSummaryAsync(ClaimsPrincipal userPrincipal);
}
