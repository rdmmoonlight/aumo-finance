using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AumoBackend.DTOs.Reports;

namespace AumoBackend.Controllers.Reports
{
    [ApiController]
    [Route("/api/v1/[controller]")]
    [Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]

    public class TrialBalanceController : ControllerBase
    {
        public static Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
            object dbContext,
            object period = null!,
            bool includeAdjusting = false,
            object extra = null!)
        {
            return Task.FromResult(new List<TrialBalanceRow>());
        }

        public static Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
            object dbContext,
            object period,
            object periodOrExtra,
            object extra = null!)
        {
            return Task.FromResult(new List<TrialBalanceRow>());
        }
    }
}
