using System.Security.Cryptography;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

#region Authentication and edge policies
var publicPem = builder.Configuration["Jwt:PublicKeyPem"];
if (string.IsNullOrWhiteSpace(publicPem)) throw new InvalidOperationException("Gateway requires Jwt:PublicKeyPem.");
var rsa = RSA.Create();
rsa.ImportFromPem(publicPem.Replace("\\n", "\n", StringComparison.Ordinal));
var publicKey = new RsaSecurityKey(rsa) { KeyId = builder.Configuration["Jwt:KeyId"] ?? "platform-v1" };
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "OnePortal",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "OnePortal",
        IssuerSigningKey = publicKey, ValidAlgorithms = [SecurityAlgorithms.RsaSha256]
    };
});
builder.Services.AddAuthorization();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins(
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"])
    .AllowAnyMethod().AllowAnyHeader().WithExposedHeaders("Content-Disposition", "Retry-After", "X-Trace-Id")));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddPolicy("api", context => RateLimitPartition.GetFixedWindowLimiter(
        context.User.FindFirst("sub")?.Value ?? context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = builder.Configuration.GetValue<int?>("RateLimits:AuthPermitLimit") ?? 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddConcurrencyLimiter("exports", options => { options.PermitLimit = 4; options.QueueLimit = 0; });
});
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
#endregion

var app = builder.Build();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.Use(async (context, next) =>
{
    context.Request.Headers.Remove("X-Tenant-Id");
    context.Request.Headers.Remove("X-Tenant-Key");
    context.Request.Headers.Remove("X-User-Id");
    context.Request.Headers.Remove("X-Role");
    context.Response.Headers["X-Trace-Id"] = System.Diagnostics.Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;
    await next(context);
});
app.MapGet("/health/live", () => Results.Ok(new { status = "live" }));
app.MapReverseProxy();
app.Run();

public partial class GatewayProgram { }
