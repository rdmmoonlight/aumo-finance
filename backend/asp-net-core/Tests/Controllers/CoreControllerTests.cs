#pragma warning disable CS1591
#pragma warning disable CA1707 // Identifiers should not contain underscores
using AumoBackend.Controllers;
using AumoBackend.DTOs.Core;
using AumoBackend.Services.Core;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace AumoBackend.Tests.Controllers;
/// <summary>
/// Mewakili Core Controller Tests.
/// </summary>

public class CoreControllerTests
{
    private readonly Mock<RustCoreService> _rustCoreServiceMock;
    private readonly Mock<IValidator<SalamRequestDto>> _validatorMock;
    private readonly Mock<ILogger<CoreController>> _loggerMock;
    private readonly CoreController _controller;
    /// <summary>
    /// Mewakili Core Controller Tests.
    /// </summary>

    public CoreControllerTests()
    {
        _rustCoreServiceMock = new Mock<RustCoreService>();
        _validatorMock = new Mock<IValidator<SalamRequestDto>>();
        _loggerMock = new Mock<ILogger<CoreController>>();

        _controller = new CoreController(
            _rustCoreServiceMock.Object,
            _validatorMock.Object,
            _loggerMock.Object
        );
    }
    /// <summary>
    /// Mengambil data  Salam Valid Input And Service Ready Returns200 Ok.
    /// </summary>

    [Fact]
    public async Task GetSalam_ValidInputAndServiceReady_Returns200Ok()
    {
        // Arrange
        var request = new SalamRequestDto { ClientName = "ObscuronApp" };
        var expectedResponse = new SalamResponse
        {
            Message = "Assalamu'alaikum dari Aumo Core (Rust FFI)",
            Service = "aumo-core",
            Version = "0.1.0",
            Status = "ready"
        };

        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult()); // Valid

        _rustCoreServiceMock
            .Setup(s => s.GetSalamAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.GetSalam(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
    }
    /// <summary>
    /// Model data Get Salam Invalid Input Returns400 Bad Request.
    /// </summary>

    [Fact]
    public async Task GetSalam_InvalidInput_Returns400BadRequest()
    {
        // Arrange
        var request = new SalamRequestDto { ClientName = "" }; // Input tidak valid
        var validationFailures = new List<ValidationFailure>
        {
            new ValidationFailure("ClientName", "Nama client tidak boleh kosong.")
        };

        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(validationFailures));

        // Act
        var result = await _controller.GetSalam(request, CancellationToken.None);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(StatusCodes.Status400BadRequest, badRequestResult.StatusCode);

        // Pastikan Rust Service TIDAK dipanggil jika validasi input gagal
        _rustCoreServiceMock.Verify(s => s.GetSalamAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
    /// <summary>
    /// Mengambil data  Salam Rust Service Returns Null Returns503 Service Unavailable.
    /// </summary>

    [Fact]
    public async Task GetSalam_RustServiceReturnsNull_Returns503ServiceUnavailable()
    {
        // Arrange
        var request = new SalamRequestDto { ClientName = "ObscuronApp" };

        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult()); // Valid

        _rustCoreServiceMock
            .Setup(s => s.GetSalamAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync((SalamResponse?)null); // FFI mengembalikan null / error

        // Act
        var result = await _controller.GetSalam(request, CancellationToken.None);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, objectResult.StatusCode);
    }
}
