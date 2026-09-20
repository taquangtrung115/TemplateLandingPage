using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TemplateLandingPage.API.Middlewares;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.DependencyInjection.Extensions;
using TemplateLandingPage.Infrastructure.Authentication;
using TemplateLandingPage.Infrastructure.DependencyInjection.Extensions;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.Data;
using TemplateLandingPage.Persistence.DependencyInjection.Extensions;
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
var secretKey = jwtSection["SecretKey"] ?? "SuperSecretKeyForTemplateLandingPage2026!@#$%^&*";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"] ?? "TemplateLandingPage",
            ValidAudience = jwtSection["Audience"] ?? "TemplateLandingPage",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization();

// Clean Architecture Layers
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPresentation();

var app = builder.Build();

// Seed initial data in Development
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        await DataSeeder.SeedAsync(dbContext, passwordHasher);
    }
    catch (SqlException sqlEx)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(sqlEx,
            "Lỗi kết nối cơ sở dữ liệu SQL Server (Error {Number}): {Message}. " +
            "Hướng dẫn khắc phục: " +
            "1. Nếu dùng LocalDB, kiểm tra/khởi động instance: 'sqllocaldb info mssqllocaldb' hoặc 'sqllocaldb start mssqllocaldb'. " +
            "2. Nếu dùng SQL Server service, kiểm tra service MSSQLSERVER hoặc MSSQL$SQLEXPRESS trong Services. " +
            "3. Kiểm tra chuỗi kết nối 'DefaultConnection' trong appsettings.json / appsettings.Development.json.",
            sqlEx.Number,
            sqlEx.Message);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Không thể khởi tạo hoặc seed dữ liệu: {Message}", ex.Message);
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
