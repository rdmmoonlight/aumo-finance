// <copyright file="IAvatarStorage.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Storage
{
    public sealed record AvatarObject(Stream Stream, string ContentType);

    /// <summary>
    /// Penyimpanan avatar pada Neon Bucket (S3-compatible).
    /// Bucket bersifat privat; avatar disajikan lewat endpoint GET /avatars/{fileName}.
    /// </summary>
    public interface IAvatarStorage
    {
        bool IsConfigured { get; }

        /// <summary>Unggah avatar, kembalikan URL publik (endpoint API) yang disimpan ke database.</summary>
        /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
        Task<string> UploadAvatarAsync(string fileName, Stream content, CancellationToken cancellationToken = default);

        /// <summary>Ambil avatar dari bucket. Null bila tidak ditemukan.</summary>
        /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
        Task<AvatarObject?> GetAvatarAsync(string fileName, CancellationToken cancellationToken = default);
    }
}
