using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace AumoBackend.Extensions;

/// <summary>
/// Aturan prefix tunggal: seluruh endpoint controller berada di bawah "/api/v1".
/// Controller cukup menulis rute relatif (mis. [Route("periods")]); prefix
/// ditambahkan di sini sehingga tidak ada rute yang lolos tanpa versi.
/// Pengecualian: controller yang sudah berawalan "api/v1" atau ditandai
/// <see cref="NoApiPrefixAttribute"/>.
/// </summary>
public sealed class ApiVersionPrefixConvention : IApplicationModelConvention
{
    public const string Prefix = "api/v1";

    public void Apply(ApplicationModel application)
    {
        foreach (var controller in application.Controllers)
        {
            if (controller.ControllerType.IsDefined(typeof(NoApiPrefixAttribute), inherit: true))
            {
                continue;
            }

            foreach (var selector in controller.Selectors)
            {
                var route = selector.AttributeRouteModel;
                if (route is null)
                {
                    continue;
                }

                var template = (route.Template ?? string.Empty).Trim().TrimStart('~', '/').TrimEnd('/');
                if (template.Equals(Prefix, StringComparison.OrdinalIgnoreCase)
                    || template.StartsWith(Prefix + "/", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                route.Template = template.Length == 0 ? Prefix : $"{Prefix}/{template}";
            }
        }
    }
}

/// <summary>Menandai controller yang sengaja berada di luar prefix "/api/v1" (mis. health check).</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class NoApiPrefixAttribute : Attribute
{
}
