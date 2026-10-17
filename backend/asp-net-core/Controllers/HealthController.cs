// <copyright file="HealthController.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Controllers;

using System;
using System.Threading.Tasks;
using AumoBackend.Controllers.Reports;
using AumoBackend.Data;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
/// <summary>
/// Controller API untuk mengelola Health.
/// </summary>

[ApiController]
[Route("/health")]
[AllowAnonymous]

public class HealthController : ControllerBase
{
    private readonly AppDbContext dbContext;
    /// <summary>
    /// Controller API untuk mengelola Health.
    /// </summary>

    public HealthController(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }
    /// <summary>
    /// Mengambil data  Health.
    /// </summary>

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            // Cek koneksi ke database PostgreSQL via AppDbContext
            bool canConnect = await this.dbContext.Database.CanConnectAsync();

            if (canConnect)
            {
                return this.Ok(new
                {
                    status = "online",
                    database = "connected",
                    commit = Environment.GetEnvironmentVariable("RENDER_GIT_COMMIT"),
                    timestamp = DateTime.UtcNow,
                });
            }

            return this.StatusCode(503, new
            {
                status = "offline",
                database = "disconnected",
                timestamp = DateTime.UtcNow,
            });
        }
        catch (Exception ex)
        {
            return this.StatusCode(503, new
            {
                status = "offline",
                database = "error",
                message = ex.Message,
                timestamp = DateTime.UtcNow,
            });
        }
    }
}
