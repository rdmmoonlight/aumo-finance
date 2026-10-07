using System.Threading;
using System.Threading.Tasks;
using AumoBackend.Services.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers
{
    /// <summary>
    /// Menyajikan avatar dari Neon Bucket (privat) melalui API.
    /// Nama file memuat GUID acak sehingga tidak dapat ditebak; respons di-cache lama.
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    [Route("/api/v1/avatars")]
    public class AvatarsController : ControllerBase
    {
        private readonly IAvatarStorage _avatarStorage;

        public AvatarsController(IAvatarStorage avatarStorage)
        {
            _avatarStorage = avatarStorage;
        }

        [HttpGet("{fileName}")]
        public async Task<IActionResult> Get(string fileName, CancellationToken cancellationToken)
        {
            if (!_avatarStorage.IsConfigured) return NotFound();

            var avatar = await _avatarStorage.GetAvatarAsync(fileName, cancellationToken);
            if (avatar == null) return NotFound();

            Response.Headers["Cache-Control"] = "public, max-age=31536000, immutable";
            Response.Headers["X-Content-Type-Options"] = "nosniff";
            return File(avatar.Stream, avatar.ContentType);
        }
    }
}
