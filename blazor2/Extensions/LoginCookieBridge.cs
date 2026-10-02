namespace AumoBlazor.Extensions;

public static class LoginCookieBridge
{
    public static void ConfigureLoginCookie(HttpContext context, string token)
    {
        context.Response.Cookies.Append("authToken", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });
    }
}
