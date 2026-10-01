using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;

namespace AumoBackend.Models
{
    public class EconomicDocument
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int? FolderId { get; set; }
        public Folder? Folder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Folder
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int? ParentFolderId { get; set; }
        public Folder? ParentFolder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
