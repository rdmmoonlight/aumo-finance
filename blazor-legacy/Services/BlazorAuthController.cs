using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

namespace BlazorAuthDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlazorAuthController : ControllerBase
    {
        private readonly ILogger<BlazorAuthController> _logger;

        public BlazorAuthController(ILogger<BlazorAuthController> logger)
        {
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Validate credentials (replace with your auth logic)
            if (IsValidUser(request.Email, request.Password))
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, request.Email),
                    new Claim(ClaimTypes.Email, request.Email),
                    new Claim(ClaimTypes.Role, GetUserRole(request.Email))
                };

                var claimsIdentity = new ClaimsIdentity(
                    claims, CookieAuthenticationDefaults.AuthenticationScheme);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = request.RememberMe,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddDays(request.RememberMe ? 30 : 1)
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                _logger.LogInformation("User {Email} logged in", request.Email);
                return Ok(new { Success = true, Message = "Login successful" });
            }

            return Unauthorized(new { Success = false, Message = "Invalid credentials" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { Success = true, Message = "Logout successful" });
        }

        [HttpGet("userinfo")]
        public IActionResult GetUserInfo()
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new { IsAuthenticated = false });
            }

            return Ok(new
            {
                IsAuthenticated = true,
                Name = User.Identity.Name,
                Email = User.FindFirstValue(ClaimTypes.Email),
                Role = User.FindFirstValue(ClaimTypes.Role)
            });
        }

        [HttpGet("external-login")]
        public IActionResult ExternalLogin(string provider, string returnUrl = "/")
        {
            var redirectUrl = Url.Action("ExternalLoginCallback", new { returnUrl });
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return Challenge(properties, provider);
        }

        [HttpGet("external-callback")]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = "/")
        {
            var result = await HttpContext.AuthenticateAsync(
                CookieAuthenticationDefaults.AuthenticationScheme);
            
            if (!result.Succeeded)
            {
                return Unauthorized(new { Success = false, Message = "External authentication failed" });
            }

            return Redirect(returnUrl);
        }

        private bool IsValidUser(string email, string password)
        {
            // Replace with proper identity verification
            return !string.IsNullOrEmpty(email) && password == "demo123";
        }

        private string GetUserRole(string email)
        {
            // Replace with role lookup
            return email.Contains("admin") ? "Admin" : "User";
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; }
    }
}
