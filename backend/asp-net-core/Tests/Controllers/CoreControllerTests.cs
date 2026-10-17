using AumoBackend.Controllers;
using AumoBackend.DTOs.Core;
using AumoBackend.Services.Core;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AumoBackend.Tests.Controllers;

public class CoreControllerTests
{
    private readonly Mock<IRustCoreService> _rustCoreServiceMock;
    private readonly Mock<IValidator<SalamRequestDto>> _validatorMock;
    private readonly Mock<ILogger<CoreController>> _loggerMock;
    private readonly CoreController _controller;

    public CoreControllerTests()
    {
        _rustCoreServiceMock = new Mock<IRustCoreService>();
        _validatorMock = new Mock<IValidator<SalamRequestDto>>();
        _loggerMock = new Mock<ILogger<CoreController>>();

        _controller = new CoreController(
            _rustCoreServiceMock.Object,
            _validatorMock.Object,
            _loggerMock.Object
        );
    }

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
