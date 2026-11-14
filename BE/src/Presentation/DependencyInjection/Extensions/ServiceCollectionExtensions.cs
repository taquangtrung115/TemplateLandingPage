namespace OnePortal.Presentation.DependencyInjection.Extensions;

using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using OnePortal.Presentation.Abstractions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        var assembly = typeof(ServiceCollectionExtensions).Assembly;

        var endpointServiceDescriptors = assembly
            .GetTypes()
            .Where(type => !type.IsAbstract &&
                           !type.IsInterface &&
                           typeof(IEndpoint).IsAssignableFrom(type))
            .Select(type => ServiceDescriptor.Transient(typeof(IEndpoint), type));

        services.TryAddEnumerable(endpointServiceDescriptors);

        return services;
    }

    public static IEndpointRouteBuilder MapEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app.ServiceProvider.GetRequiredService<IEnumerable<IEndpoint>>();

        foreach (var endpoint in endpoints)
        {
            endpoint.MapEndpoint(app);
        }

        return app;
    }
}
