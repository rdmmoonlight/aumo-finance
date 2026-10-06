using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.ComponentModel.DataAnnotations;

namespace AumoBackend.Models;

public class Period
{
    [Key]
    public int Id { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [StringLength(100)]
    public string PeriodName { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsClosed { get; set; }
    public bool IsSelected { get; set; }
}

