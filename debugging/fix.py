import os

def fix_blazor_auth_and_routing(blazor_path):
    components_dir = os.path.join(blazor_path, "Components")
    os.makedirs(components_dir, exist_ok=True)

    print("=== MEMPERBARUI PROGRAM.CS DENGAN AUTHENTICATION SERVICES ===")

    # 1. Update Program.cs
    program_path = os.path.join(blazor_path, "Program.cs")
    program_content = """using AumoBlazor.Components;
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
"""
    with open(program_path, "w", encoding="utf-8") as f:
        f.write(program_content)
    print("  [✓] Program.cs diperbarui dengan AuthStateProvider.")

    # 2. Update Routes.razor dengan CascadingAuthenticationState & Router
    routes_path = os.path.join(components_dir, "Routes.razor")
    routes_content = """@using Microsoft.AspNetCore.Components.Routing
@using Microsoft.AspNetCore.Components.Authorization

<CascadingAuthenticationState>
    <Router AppAssembly="@typeof(Program).Assembly">
        <Found Context="routeData">
            <AuthorizeRouteView RouteData="@routeData" DefaultLayout="@typeof(Layout.MainLayout)">
                <NotAuthorized>
                    <p role="alert">Anda tidak memiliki akses ke halaman ini.</p>
                </NotAuthorized>
                <Authorizing>
                    <p>Memuat otentikasi...</p>
                </Authorizing>
            </AuthorizeRouteView>
            <FocusOnNavigate RouteData="@routeData" Selector="h1" />
        </Found>
        <NotFound>
            <PageTitle>Not found</PageTitle>
            <LayoutView Layout="@typeof(Layout.MainLayout)">
                <p role="alert">Maaf, halaman tidak ditemukan.</p>
            </LayoutView>
        </NotFound>
    </Router>
</CascadingAuthenticationState>
"""
    with open(routes_path, "w", encoding="utf-8") as f:
        f.write(routes_content)
    print("  [✓] Components/Routes.razor diperbarui dengan CascadingAuthenticationState.")

if __name__ == "__main__":
    blazor_path = r"E:\Github\aumo-finance\blazor2"
    if not os.path.exists(blazor_path):
        blazor_path = os.path.join(os.getcwd(), "blazor2")

    print("=== PERBAIKAN AUTH & ROUTING BLAZOR ===")
    fix_blazor_auth_and_routing(blazor_path)
    print("=== SELESAI ===")