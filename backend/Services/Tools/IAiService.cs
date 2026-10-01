using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.Threading.Tasks;

namespace AumoBackend.Services.Tools;

public interface IAiService
{
    Task<string> AnalyzeFinancialQueryAsync(string userPrompt, string contextData = "");
}
