using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AumoBackend.DTOs.Reports;

namespace AumoBackend.Controllers.Reports
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrialBalanceController : ControllerBase
    {
        public static Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
            object dbContext, 
            object period = null, 
            bool includeAdjusting = false, 
            object extra = null)
        {
            return Task.FromResult(new List<TrialBalanceRow>());
        }

        public static Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
            object dbContext, 
            object period, 
            object periodOrExtra, 
            object extra = null)
        {
            return Task.FromResult(new List<TrialBalanceRow>());
        }
    }
}
