namespace OnePortal.Persistence.DependencyInjection.Extensions;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;
using OnePortal.Domain.Repositories.Quoting;
using OnePortal.Persistence.Interceptors;
using OnePortal.Persistence.Repositories;
using OnePortal.Persistence.Repositories.Quoting;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Persistence.Initialization;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<TenantContext>();
        services.AddScoped<ITenantContext>(provider => provider.GetRequiredService<TenantContext>());
        services.AddScoped<RequestActor>();
        services.AddScoped<IRequestActor>(provider => provider.GetRequiredService<RequestActor>());
        services.AddScoped<ITenantStore, OnePortal.Persistence.Repositories.Tenancy.TenantStore>();
        services.AddSingleton<AuditableEntityInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var interceptor = sp.GetRequiredService<AuditableEntityInterceptor>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
                npgsqlOptions.CommandTimeout(60);
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            })
            .UseSeeding((context, _) => DatabaseInitializer.SeedAsync((ApplicationDbContext)context).GetAwaiter().GetResult())
            .UseAsyncSeeding((context, _, token) => DatabaseInitializer.SeedAsync((ApplicationDbContext)context, token))
            .AddInterceptors(interceptor);
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<INavigationMenuRepository, NavigationMenuRepository>();
        services.AddScoped<ITemplateRepository, TemplateRepository>();
        services.AddScoped<ICustomizationRepository, CustomizationRepository>();
        services.AddScoped<IRsvpRepository, RsvpRepository>();
        services.AddScoped<IGuestbookRepository, GuestbookRepository>();
        services.AddScoped<IAdminOverviewRepository, AdminOverviewRepository>();

        // Quoting Repositories
        services.AddScoped<IQuotingProductGroupRepository, QuotingProductGroupRepository>();
        services.AddScoped<IQuotingProductRepository, QuotingProductRepository>();
        services.AddScoped<IQuotingCustomerRepository, QuotingCustomerRepository>();
        services.AddScoped<IQuotationTemplateRepository, QuotationTemplateRepository>();
        services.AddScoped<IQuotationRepository, QuotationRepository>();
        services.AddScoped<IQuotationSummaryService, QuotationSummaryService>();
        services.AddScoped<IQuotingSupportRepository, QuotingSupportRepository>();

        return services;
    }
}
