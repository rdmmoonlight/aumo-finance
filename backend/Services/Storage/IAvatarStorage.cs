using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace AumoBackend.Services.Storage
{
    public sealed record AvatarObject(Stream Stream, string ContentType);

    /// <summary>
    /// Penyimpanan avatar pada Neon Bucket (S3-compatible).
    /// Bucket bersifat privat; avatar disajikan lewat endpoint GET /api/v1/avatars/{fileName}.
    /// </summary>
    public interface IAvatarStorage
    {
        bool IsConfigured { get; }

        /// <summary>Unggah avatar, kembalikan URL publik (endpoint API) yang disimpan ke database.</summary>
        Task<string> UploadAvatarAsync(string fileName, Stream content, CancellationToken cancellationToken = default);

        /// <summary>Ambil avatar dari bucket. Null bila tidak ditemukan.</summary>
        Task<AvatarObject?> GetAvatarAsync(string fileName, CancellationToken cancellationToken = default);
    }
}
