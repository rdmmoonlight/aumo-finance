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

builder.Services.AddHttpClient();
builder.Services.AddScoped(sp => new HttpClient 
{ 
    BaseAddress = new Uri(builder.Configuration["ApiBaseUrl"] ?? "http://localhost:5000/") 
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
        // Secara default mengembalikan user dummy terautentikasi / anonim
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "Ghofur User")
        }, "HonoAuth");

        var user = new ClaimsPrincipal(identity);
        return Task.FromResult(new AuthenticationState(user));
    }
}
