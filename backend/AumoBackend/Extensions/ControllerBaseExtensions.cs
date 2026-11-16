namespace AumoBackend.Extensions;

using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

public static class ControllerBaseExtensions
{
    public static IActionResult HandleServiceException(this ControllerBase controller, Exception ex)
    {
        return ex switch
        {
            KeyNotFoundException => controller.NotFound(new { success = false, message = ex.Message }),
            InvalidOperationException => controller.BadRequest(new { success = false, message = ex.Message }),
            _ => throw ex
        };
    }
}
