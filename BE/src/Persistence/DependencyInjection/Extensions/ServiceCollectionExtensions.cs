namespace TemplateLandingPage.Persistence.DependencyInjection.Extensions;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories;
using TemplateLandingPage.Domain.Repositories.Quoting;
using TemplateLandingPage.Persistence.Interceptors;
using TemplateLandingPage.Persistence.Repositories;
using TemplateLandingPage.Persistence.Repositories.Quoting;
using TemplateLandingPage.Application.Abstractions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
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
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning))
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
        services.AddScoped<IQuotingProductRepository, QuotingProductRepository>();
        services.AddScoped<IQuotingCustomerRepository, QuotingCustomerRepository>();
        services.AddScoped<IQuotationTemplateRepository, QuotationTemplateRepository>();
        services.AddScoped<IQuotationRepository, QuotationRepository>();
        services.AddScoped<IQuotationSummaryService, QuotationSummaryService>();
        services.AddScoped<IQuotingSupportRepository, QuotingSupportRepository>();

        return services;
    }
}
