using AumoBlazor.Components;
using Microsoft.AspNetCore.Components.Authorization;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddAuthorizationCore();
builder.Services.AddCascadingAuthenticationState();

// Mock AuthenticationStateProvider jika otentikasi dikelola oleh Hono API
builder.Services.AddScoped<AuthenticationStateProvider, AnonymousAuthStateProvider>();

// Konfigurasi HttpClient yang rapi
builder.Services.AddHttpClient();
builder.Services.AddScoped(sp =>
{
    // Mengambil dari appsettings.json, jika tidak ada baru fallback ke URL Render / Localhost
    var apiBaseUrl = builder.Configuration["ApiBaseUrl"] ?? "https://aumohono.onrender.com/";
    
    return new HttpClient
    {
        BaseAddress = new Uri(apiBaseUrl)
    };
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();

// Provider sederhana agar AuthorizeView / CascadingAuthenticationState bekerja tanpa error
public class AnonymousAuthStateProvider : AuthenticationStateProvider
{
    public override Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        // Secara default mengembalikan user terautentikasi
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "Ghofur User")
        }, "HonoAuth");

        var user = new ClaimsPrincipal(identity);
        return Task.FromResult(new AuthenticationState(user));
    }
}
