using AumoBlazor.Components;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using System.Net;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// 1. DOKUR: Fix Data Protection Keys di Render agar Antiforgery Cookie tidak Error 400 saat restart
var keysFolder = Path.Combine(builder.Environment.ContentRootPath, "temp-keys");
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(keysFolder))
    .SetApplicationName("AumoBlazorApp");

// 2. Add services to the container
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// 3. Konfigurasi Cookie Authentication murni ASP.NET Core
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "Aumo_AuthCookie";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS Render
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.LoginPath = "/login";
        options.LogoutPath = "/api/auth/logout";
        options.ExpireTimeSpan = TimeSpan.FromDays(30); // Durasi session cookie
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorizationCore();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddHttpContextAccessor();

// Re-register Custom AuthenticationStateProvider yang membaca Cookie HTTPContext
builder.Services.AddScoped<AuthenticationStateProvider, CookieAuthStateProvider>();

// 4. HttpClient dengan SocketsHttpHandler agar Cookie terisi & terus terkirim otomatis ke Hono/Backend
builder.Services.AddScoped(sp =>
{
    var apiBaseUrl = builder.Configuration["ApiBaseUrl"] ?? "https://aumohono.onrender.com/";

    var handler = new HttpClientHandler
    {
        UseCookies = true,
        CookieContainer = new CookieContainer()
    };

    return new HttpClient(handler)
    {
        BaseAddress = new Uri(apiBaseUrl)
    };
});

// 5. Konfigurasi Forwarded Headers agar SSL/HTTPS Reverse Proxy di Render terbaca tepat
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

app.UseForwardedHeaders(); // Wajib di paling atas

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// Wajib aktifkan Authentication & Authorization Middleware sebelum Antiforgery
app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();

// ============================================================================
// Auth State Provider berbasis Cookie Session
// ============================================================================
public class CookieAuthStateProvider : AuthenticationStateProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CookieAuthStateProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public override Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        var user = _httpContextAccessor.HttpContext?.User;

        // Memeriksa apakah cookie session aktif & terautentikasi
        if (user?.Identity != null && user.Identity.IsAuthenticated)
        {
            return Task.FromResult(new AuthenticationState(user));
        }

        // Return user anonim jika cookie tidak ada / tidak valid
        var anonymous = new ClaimsPrincipal(new ClaimsIdentity());
        return Task.FromResult(new AuthenticationState(anonymous));
    }
}
