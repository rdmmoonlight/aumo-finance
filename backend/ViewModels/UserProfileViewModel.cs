using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace AumoBackend.ViewModels;

public class UserProfileViewModel
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Email { get; set; }
    public string? UserName { get; set; }
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
    public IList<Claim> CustomClaims { get; set; } = new List<Claim>();
}
