using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using System;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace AumoBackend.Services.Tools;

public class CloudinaryService : ICloudStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var account = new Account(config["CloudinarySettings:CloudName"], config["CloudinarySettings:ApiKey"], config["CloudinarySettings:ApiSecret"]);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<(string PublicId, string Url, long FileSize)> UploadFileAsync(IFormFile file, string folderName = "documents")
    {
        if (file == null || file.Length == 0) throw new ArgumentException("File tidak boleh kosong.");
        using var stream = file.OpenReadStream();
        var uploadParams = new RawUploadParams { File = new FileDescription(file.FileName, stream), Folder = folderName, UseFilename = true, UniqueFilename = true };
        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        if (uploadResult.Error != null) throw new Exception($"Cloudinary Upload Error: {uploadResult.Error.Message}");
        return (uploadResult.PublicId, uploadResult.SecureUrl.ToString(), uploadResult.Bytes);
    }

    public async Task<bool> DeleteFileAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId) { ResourceType = ResourceType.Raw };
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }
}
