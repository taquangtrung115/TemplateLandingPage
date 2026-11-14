namespace OnePortal.Infrastructure.DependencyInjection.Extensions;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OnePortal.Application.Abstractions;
using OnePortal.Infrastructure.Abstractions;
using OnePortal.Infrastructure.Authentication;
using OnePortal.Infrastructure.Services;
using OnePortal.Infrastructure.Services.Quoting;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        // Quoting Services
        services.AddHttpClient<SupabaseStorageService>()
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false });
        services.AddScoped<LocalStorageService>();
        services.AddScoped<IQuotationFileStorageService, QuotationFileStorageResolver>();
        services.AddHttpClient<IQuotingProductImageService, SupabaseProductImageService>(client => client.Timeout = TimeSpan.FromSeconds(20))
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false });
        services.AddHttpClient<IQuotationRemoteImageService, QuotationRemoteImageService>(client => client.Timeout = TimeSpan.FromSeconds(10))
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false });
        services.AddScoped<IQuotationExportService, QuotationHtmlExportService>();

        return services;
    }
}
