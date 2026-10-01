using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace AumoBackend.Services.Tools;

public interface ICloudStorageService
{
    Task<(string PublicId, string Url, long FileSize)> UploadFileAsync(IFormFile file, string folderName = "documents");
    Task<bool> DeleteFileAsync(string publicId);
}
