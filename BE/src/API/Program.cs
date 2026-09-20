using TemplateLandingPage.API.Middlewares;
using TemplateLandingPage.Application.DependencyInjection.Extensions;
using TemplateLandingPage.Infrastructure.DependencyInjection.Extensions;
using TemplateLandingPage.Persistence.DependencyInjection.Extensions;
using TemplateLandingPage.Presentation.DependencyInjection.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// Clean Architecture Layers
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddInfrastructure();
builder.Services.AddPresentation();

var app = builder.Build();

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

app.UseHttpsRedirection();
app.UseCors("DefaultCorsPolicy");

// Map Minimal APIs
app.MapEndpoints();

app.Run();

public partial class Program { }
