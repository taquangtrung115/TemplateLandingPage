namespace TemplateLandingPage.Infrastructure.DependencyInjection.Extensions;

using Microsoft.Extensions.DependencyInjection;
using TemplateLandingPage.Infrastructure.Abstractions;
using TemplateLandingPage.Infrastructure.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }
}
