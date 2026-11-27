namespace OnePortal.API.Middlewares;

using System.Text.RegularExpressions;

public sealed class TenantRoutingMiddleware(RequestDelegate next)
{
    public const string SelectionKey = "TenantRouteSelection";

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? "/";
        if (path.StartsWith("/t/", StringComparison.OrdinalIgnoreCase))
        {
            var match = Regex.Match(path, "^/t/([a-z0-9][a-z0-9-]{1,62})/api/v1/(landing|quoting|photoprint)(/.*)?$", RegexOptions.CultureInvariant);
            if (!match.Success) { context.Response.StatusCode = 404; return; }
            var key = match.Groups[1].Value; var appKey = match.Groups[2].Value;
            var remainder = match.Groups[3].Value;
            if (remainder.StartsWith("/platform", StringComparison.OrdinalIgnoreCase) || remainder.StartsWith("/portal", StringComparison.OrdinalIgnoreCase)
                || remainder.StartsWith("/quoting", StringComparison.OrdinalIgnoreCase)
                || remainder.StartsWith("/photoprint", StringComparison.OrdinalIgnoreCase)
                || remainder.StartsWith("/users", StringComparison.OrdinalIgnoreCase)) { context.Response.StatusCode = 404; return; }
            context.Items[SelectionKey] = (key, appKey);
            context.Response.OnStarting(() =>
            {
                var location = context.Response.Headers.Location.ToString();
                var oldPrefix = appKey is "quoting" or "photoprint" ? $"/api/v1/{appKey}" : "/api/v1";
                if (location.StartsWith(oldPrefix + "/", StringComparison.Ordinal))
                    context.Response.Headers.Location = $"/t/{key}/api/v1/{appKey}" + location[oldPrefix.Length..];
                return Task.CompletedTask;
            });
            var shared = remainder.StartsWith("/auth/", StringComparison.Ordinal) || remainder == "/context" || remainder.StartsWith("/members", StringComparison.Ordinal);
            context.Request.PathBase = $"/t/{key}";
            context.Request.Path = "/api/v1" + (!shared && appKey is ("quoting" or "photoprint") ? $"/{appKey}" : "") + remainder;
        }
        else if (path.StartsWith("/api/v1/quoting", StringComparison.Ordinal)) context.Items[SelectionKey] = ("quoting-default", "quoting");
        else if (path.Equals("/api/v1/photoprint", StringComparison.Ordinal) || path.StartsWith("/api/v1/photoprint/", StringComparison.Ordinal)) context.Items[SelectionKey] = ("photoprint-default", "photoprint");
        else if ((path == "/api/v1/auth/register" || path == "/api/v1/auth/registration") || (path.StartsWith("/api/v1/", StringComparison.Ordinal) && !path.StartsWith("/api/v1/auth/", StringComparison.Ordinal)
            && !path.StartsWith("/api/v1/platform/", StringComparison.Ordinal)
            && !path.StartsWith("/api/v1/portal/", StringComparison.Ordinal))) context.Items[SelectionKey] = ("landing-default", "landing");
        await next(context);
    }
}
