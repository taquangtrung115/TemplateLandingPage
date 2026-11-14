using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using OnePortal.API.Middlewares;
using OnePortal.Application.Abstractions;
using OnePortal.Application.DependencyInjection.Extensions;
using OnePortal.Infrastructure.Authentication;
using OnePortal.Infrastructure.DependencyInjection.Extensions;
using OnePortal.Persistence;
using OnePortal.Persistence.Data;
using OnePortal.Persistence.DependencyInjection.Extensions;
using OnePortal.Presentation.Authorization;
using OnePortal.Presentation.DependencyInjection.Extensions;

var initializeDatabase = args.Contains("--initialize-database", StringComparer.Ordinal);
var builder = WebApplication.CreateBuilder(args.Where(argument => argument != "--initialize-database").ToArray());

if (initializeDatabase)
{
    var migrationConnection = Environment.GetEnvironmentVariable("TEMPLATE_MIGRATION_CONNECTION_STRING")
        ?? builder.Configuration.GetConnectionString("MigrationConnection") ?? builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Configuration["ConnectionStrings:DefaultConnection"] = migrationConnection;
    builder.Services.AddPersistence(builder.Configuration);
    await using var initializationApp = builder.Build();
    await using var scope = initializationApp.Services.CreateAsyncScope();
    var database = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await OnePortal.Persistence.Initialization.DatabaseInitializer.InitializeAsync(database);
    await OnePortal.Persistence.Initialization.DatabaseInitializer.BootstrapAdministratorAsync(database, builder.Configuration);
    return;
}

// Add Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "OnePortal API",
        Version = "v1",
        Description = "Shared portal API for tenants, templates and quoting"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token theo dạng: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Authentication & JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();
    if (!builder.Environment.IsDevelopment() && string.IsNullOrWhiteSpace(jwtSettings.PrivateKeyPem))
        throw new InvalidOperationException("Production requires Jwt:PrivateKeyPem and RSA signing.");
    var validationKey = JwtKeyMaterial.Create(jwtSettings, signing: false);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer, ValidAudience = jwtSettings.Audience, IssuerSigningKey = validationKey,
        ValidAlgorithms = validationKey is RsaSecurityKey ? [SecurityAlgorithms.RsaSha256] : [SecurityAlgorithms.HmacSha256]
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PlatformAdmin", policy => policy.RequireAuthenticatedUser().RequireClaim("platform_admin", "true"));
    options.AddPolicy(AuthorizationPolicies.AdminOnly, policy =>
        policy.RequireAuthenticatedUser().RequireRole("Admin"));
});

// Clean Architecture Layers
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPresentation();

var app = builder.Build();
// Validate key material after host/test configuration is complete and before accepting traffic.
_ = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptionsMonitor<JwtBearerOptions>>().Get(JwtBearerDefaults.AuthenticationScheme);

// Initialization finishes before any endpoint accepts traffic.
await using (var initializationScope = app.Services.CreateAsyncScope())
{
    var database = initializationScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var mode = builder.Configuration["DatabaseInitialization:Mode"] ?? (app.Environment.IsDevelopment() ? "Startup" : "Verify");
    if (mode == "Startup")
    {
        await OnePortal.Persistence.Initialization.DatabaseInitializer.InitializeAsync(database);
        await OnePortal.Persistence.Initialization.DatabaseInitializer.BootstrapAdministratorAsync(database, builder.Configuration);
    }
    else if (mode == "Verify")
    {
        if ((await database.Database.GetPendingMigrationsAsync()).Any()) throw new InvalidOperationException("Run the database initialization deployment step before starting this version.");
        foreach (var appKey in OnePortal.Domain.Entities.Tenancy.TenantDefaults.ApplicationKeys)
        {
            var requiredVersion = OnePortal.Persistence.Initialization.DatabaseInitializer.RequiredVersion(appKey);
            if (await database.TenantApplications.IgnoreQueryFilters().AnyAsync(application => application.AppKey == appKey && application.IsEnabled
                && application.ProvisioningStatus == "Ready" && application.SeedVersion < requiredVersion))
                throw new InvalidOperationException("Required tenant initialization has not completed.");
        }
    }
    else if (mode != "Disabled") throw new InvalidOperationException("Unknown database initialization mode.");

    if (app.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("SeedData:Enabled"))
    {
        await using var landing = new ApplicationDbContext(database.GetOptions(), OnePortal.Application.Services.Tenancy.TenantContext.For(OnePortal.Domain.Entities.Tenancy.TenantDefaults.LandingId, "landing"));
        await DataSeeder.SeedAsync(landing, initializationScope.ServiceProvider.GetRequiredService<IPasswordHasher>());
        if (builder.Configuration.GetValue<bool>("SeedData:IncludeCatalog", true)) await TemplateCatalogSeeder.SeedAsync(landing);
        await using var quoting = new ApplicationDbContext(database.GetOptions(), OnePortal.Application.Services.Tenancy.TenantContext.For(OnePortal.Domain.Entities.Tenancy.TenantDefaults.QuotingId, "quoting"));
        await QuotingSeeder.SeedAsync(quoting);
        var demoEmails = new List<string> { "admin@template.com", "user@template.com", "minhlinh@template.com" };
        var demoUsers = await database.Users.AsNoTracking().Where(user => demoEmails.Contains(user.Email) && user.IsActive).Select(user => new { user.Id, user.Role }).ToListAsync();
        foreach (var demoContext in new[] { landing, quoting })
        {
            var existing = await demoContext.TenantMemberships.Select(membership => membership.UserId).ToListAsync();
            foreach (var demoUser in demoUsers.Where(user => !existing.Contains(user.Id)))
                demoContext.TenantMemberships.Add(OnePortal.Domain.Entities.Tenancy.TenantMembership.Create(demoContext.CurrentTenantId, demoUser.Id, demoContext.CurrentAppKey, demoUser.Role));
            await demoContext.SaveChangesAsync();
        }
    }
}

// Configure Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "OnePortal API v1");
    });
}

app.UseCors("DefaultCorsPolicy");

// HTTPS terminates at the public edge; the private backend receives internal HTTP.
app.UseMiddleware<TenantRoutingMiddleware>();
app.UseRouting();
app.UseAuthentication();
app.UseMiddleware<TenantAccessMiddleware>();
app.UseAuthorization();
app.UseWhen(context => !context.Request.Path.StartsWithSegments("/exports/quotations"), branch => branch.UseStaticFiles());
var quotingImageDirectory = Path.Combine(AppContext.BaseDirectory, "wwwroot", "api", "v1", "quoting", "product-images");
if (Directory.Exists(quotingImageDirectory))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(quotingImageDirectory),
        RequestPath = "/api/v1/quoting/product-images"
    });
}

app.MapGet("/health/live", () => Results.Ok(new { status = "live" }));
app.MapGet("/health/ready", async (ApplicationDbContext database, CancellationToken token) =>
    await database.Database.CanConnectAsync(token) ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503));

// Map Minimal APIs
app.MapEndpoints();

app.Run();

public partial class Program { }
