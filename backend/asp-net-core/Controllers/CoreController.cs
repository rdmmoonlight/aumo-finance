using AumoBackend.DTOs.Core;
using AumoBackend.Services.Core;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers;
/// <summary>
/// Controller API untuk mengelola Core.
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class CoreController : ControllerBase
{
    private static readonly Action<ILogger, Exception?> FfiResponseError =
        LoggerMessage.Define(LogLevel.Error, new EventId(1, nameof(FfiResponseError)),
            "[FFI ERROR] Gagal mendapatkan respon dari modul native Rust.");

    private readonly RustCoreService _rustCoreService;
    private readonly IValidator<SalamRequestDto> _salamValidator;
    private readonly ILogger<CoreController> _logger;
/// <summary>
/// Controller API untuk mengelola Core.
/// </summary>

    public CoreController(
        RustCoreService rustCoreService,
        IValidator<SalamRequestDto> salamValidator,
        ILogger<CoreController> logger)
    {
        _rustCoreService = rustCoreService;
        _salamValidator = salamValidator;
        _logger = logger;
    }
/// <summary>
/// Mengambil data  Salam.
/// </summary>

    [HttpPost("salam")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetSalam([FromBody] SalamRequestDto request, CancellationToken ct)
    {
        // 1. Validasi Input menggunakan FluentValidation
        var validationResult = await _salamValidator.ValidateAsync(request, ct);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                Status = "Error",
                Message = "Validasi input gagal.",
                Errors = validationResult.Errors.Select(e => new
                {
                    Field = e.PropertyName,
                    Error = e.ErrorMessage
                })
            });
        }

        // 2. Panggil Service Native Rust FFI (in-memory)
        var response = await _rustCoreService.GetSalamAsync(ct);
        if (response == null)
        {
            FfiResponseError(_logger, null);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                Status = "Error",
                Message = "Layanan modul internal Rust tidak merespon."
            });
        }

        // 3. Kembalikan Response
        return Ok(new
        {
            Status = "Success",
            Client = request.ClientName,
            Data = response
        });
    }
/// <summary>
/// Mengambil data  Salam Simple.
/// </summary>

    [HttpGet("salam")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetSalamSimple(CancellationToken ct)
    {
        var response = await _rustCoreService.GetSalamAsync(ct);
        if (response == null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                Status = "Error",
                Message = "Gagal memanggil fungsi native Rust FFI."
            });
        }

        return Ok(response);
    }
}
