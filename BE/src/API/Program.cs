using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using TemplateLandingPage.API.Middlewares;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.DependencyInjection.Extensions;
using TemplateLandingPage.Infrastructure.Authentication;
using TemplateLandingPage.Infrastructure.DependencyInjection.Extensions;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.Data;
using TemplateLandingPage.Persistence.DependencyInjection.Extensions;
using TemplateLandingPage.Presentation.Authorization;
using TemplateLandingPage.Presentation.DependencyInjection.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Template Landing Page API",
        Version = "v1",
        Description = "API for Landing Page Management & Customizer"
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
    ?? new[] { "http://localhost:5173", "http://localhost:3000" };

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
var jwtSection = builder.Configuration.GetSection(JwtSettings.SectionName);
var secretKey = jwtSection["SecretKey"];
if (string.IsNullOrWhiteSpace(secretKey) || Encoding.UTF8.GetByteCount(secretKey) < 32)
{
    throw new InvalidOperationException("Jwt:SecretKey must be configured with at least 32 bytes.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var principal = context.Principal;
                var subject = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

                if (!Guid.TryParse(subject, out var userId) || principal?.Identity is not ClaimsIdentity identity)
                {
                    context.Fail("Invalid access token.");
                    return;
                }

                try
                {
                    var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                    var role = await dbContext.Users
                        .AsNoTracking()
                        .Where(user => user.Id == userId && user.IsActive && !user.IsDeleted)
                        .Select(user => user.Role)
                        .SingleOrDefaultAsync(context.HttpContext.RequestAborted);

                    if (role is null)
                    {
                        context.Fail("The account is unavailable.");
                        return;
                    }

                    foreach (var claimsIdentity in principal.Identities)
                    {
                        foreach (var roleClaim in claimsIdentity.FindAll(ClaimTypes.Role).ToList())
                        {
                            claimsIdentity.RemoveClaim(roleClaim);
                        }
                    }

                    identity.AddClaim(new Claim(ClaimTypes.Role, role));
                }
                catch (OperationCanceledException) when (context.HttpContext.RequestAborted.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception exception)
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILoggerFactory>()
                        .CreateLogger("JwtAccountValidation");
                    logger.LogError(
                        "Account validation failed for operation {OperationId} ({ExceptionType}).",
                        context.HttpContext.TraceIdentifier,
                        exception.GetType().Name);
                    context.Fail("Account validation failed.");
                }
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.AdminOnly, policy =>
        policy.RequireAuthenticatedUser().RequireRole("Admin"));
});

// Clean Architecture Layers
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPresentation();

var app = builder.Build();

// Demo data is only inserted after an explicit local development opt-in.
if (app.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("SeedData:Enabled"))
{
    using var scope = app.Services.CreateScope();
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        await DataSeeder.SeedAsync(dbContext, passwordHasher);
        if (builder.Configuration.GetValue<bool>("SeedData:IncludeCatalog", true))
        {
            await TemplateCatalogSeeder.SeedAsync(dbContext);
        }
    }
    catch (NpgsqlException npgsqlEx)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError("Development seed failed with PostgreSQL state {SqlState}.", npgsqlEx.SqlState);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError("Development seed failed ({ExceptionType}).", ex.GetType().Name);
    }
}

// Configure Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Template Landing Page API v1");
    });
}

app.UseCors("DefaultCorsPolicy");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

// Map Minimal APIs
app.MapEndpoints();

app.Run();

public partial class Program { }
