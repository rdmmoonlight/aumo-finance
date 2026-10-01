using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using AumoBackend.Models;

namespace AumoBackend.Helpers
{
    public static class SelectedPeriodHelper
    {
        public static Period? GetSelectedPeriod(HttpContext context) => null;
        public static Period? GetSelectedPeriod(object a1, object a2 = null) => null;

        public static Task<Period?> GetSelectedPeriodAsync(HttpContext context) => Task.FromResult<Period?>(null);
        public static Task<Period?> GetSelectedPeriodAsync(object a1, object a2 = null) => Task.FromResult<Period?>(null);

        public static int? GetSelectedPeriodId(HttpContext context) => null;

        public static Task SelectPeriodAsync(HttpContext context, int periodId) => Task.CompletedTask;
        public static Task SelectPeriodAsync(object a1, object a2, object a3 = null) => Task.CompletedTask;

        public static Task ClearSelectionAsync(HttpContext context) => Task.CompletedTask;
        public static Task ClearSelectionAsync(object a1, object a2 = null) => Task.CompletedTask;
    }
}
