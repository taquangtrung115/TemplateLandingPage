namespace TemplateLandingPage.UnitTests.Persistence;

using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.DependencyInjection.Extensions;
using TemplateLandingPage.Persistence.Interceptors;
using TemplateLandingPage.Persistence.Repositories;
using Xunit;

public class ServiceCollectionExtensionsTests
{
    private const string DefaultPostgreSqlConnectionString =
        "Host=localhost;Port=5432;Database=TemplateLandingPageDb;Username=postgres;Password=postgres;";

    private static IConfiguration CreateConfiguration(string? connectionString)
    {
        var configurationMock = new Mock<IConfiguration>();
        var sectionMock = new Mock<IConfigurationSection>();

        if (connectionString != null)
        {
            sectionMock.Setup(s => s["DefaultConnection"]).Returns(connectionString);
        }

        configurationMock.Setup(c => c.GetSection("ConnectionStrings")).Returns(sectionMock.Object);
        return configurationMock.Object;
    }

    #region 1. Happy Path Tests

    [Fact]
    public void AddPersistence_Should_RegisterAllRequiredPersistenceServices()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(DefaultPostgreSqlConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        // Assert
        scopedProvider.GetService<ApplicationDbContext>().Should().NotBeNull();
        scopedProvider.GetService<IUnitOfWork>().Should().NotBeNull();
        scopedProvider.GetService<IUserRepository>().Should().NotBeNull();
        scopedProvider.GetService<ITemplateRepository>().Should().NotBeNull();
        scopedProvider.GetService<ICategoryRepository>().Should().NotBeNull();
        scopedProvider.GetService<IProductRepository>().Should().NotBeNull();
        scopedProvider.GetService<INavigationMenuRepository>().Should().NotBeNull();
        scopedProvider.GetService<ICustomizationRepository>().Should().NotBeNull();
        scopedProvider.GetService<IRsvpRepository>().Should().NotBeNull();
        scopedProvider.GetService<IGuestbookRepository>().Should().NotBeNull();
    }

    [Fact]
    public void AddPersistence_Should_RegisterConcreteRepositoryTypesCorrectly()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(DefaultPostgreSqlConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        // Assert concrete types
        scopedProvider.GetRequiredService<IUnitOfWork>().Should().BeOfType<UnitOfWork>();
        scopedProvider.GetRequiredService<IUserRepository>().Should().BeOfType<UserRepository>();
        scopedProvider.GetRequiredService<ITemplateRepository>().Should().BeOfType<TemplateRepository>();
        scopedProvider.GetRequiredService<ICategoryRepository>().Should().BeOfType<CategoryRepository>();
        scopedProvider.GetRequiredService<IProductRepository>().Should().BeOfType<ProductRepository>();
        scopedProvider.GetRequiredService<INavigationMenuRepository>().Should().BeOfType<NavigationMenuRepository>();
        scopedProvider.GetRequiredService<ICustomizationRepository>().Should().BeOfType<CustomizationRepository>();
        scopedProvider.GetRequiredService<IRsvpRepository>().Should().BeOfType<RsvpRepository>();
        scopedProvider.GetRequiredService<IGuestbookRepository>().Should().BeOfType<GuestbookRepository>();
    }

    [Fact]
    public void AddPersistence_Should_ConfigureAuditableEntityInterceptorAsSingleton()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(DefaultPostgreSqlConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();

        using var scope1 = serviceProvider.CreateScope();
        using var scope2 = serviceProvider.CreateScope();

        var interceptor1 = scope1.ServiceProvider.GetRequiredService<AuditableEntityInterceptor>();
        var interceptor2 = scope2.ServiceProvider.GetRequiredService<AuditableEntityInterceptor>();

        // Assert - Singleton across different scopes
        interceptor1.Should().NotBeNull();
        interceptor1.Should().BeSameAs(interceptor2);
    }

    [Fact]
    public void AddPersistence_Should_RegisterRepositoriesAndDbContextAsScoped()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(DefaultPostgreSqlConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();

        using var scope1 = serviceProvider.CreateScope();
        using var scope2 = serviceProvider.CreateScope();

        var dbContext1 = scope1.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var dbContext2 = scope2.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var uow1 = scope1.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var uow2 = scope2.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var userRepo1 = scope1.ServiceProvider.GetRequiredService<IUserRepository>();
        var userRepo2 = scope2.ServiceProvider.GetRequiredService<IUserRepository>();

        // Assert - Different instances per scope
        dbContext1.Should().NotBeSameAs(dbContext2);
        uow1.Should().NotBeSameAs(uow2);
        userRepo1.Should().NotBeSameAs(userRepo2);
    }

    [Fact]
    public void AddPersistence_Should_ConfigureNpgsqlProviderForDbContext()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(DefaultPostgreSqlConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        dbContext.Database.ProviderName.Should().Be("Npgsql.EntityFrameworkCore.PostgreSQL");
    }

    [Fact]
    public void AddPersistence_Should_ConfigureNpgsqlSpecificOptions()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(DefaultPostgreSqlConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var dbOptions = scope.ServiceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>();

        // Assert - Relational and Npgsql options
        var relationalOptions = Microsoft.EntityFrameworkCore.Infrastructure.RelationalOptionsExtension.Extract(dbOptions);
        relationalOptions.CommandTimeout.Should().Be(60);
        relationalOptions.MigrationsAssembly.Should().Be(typeof(ApplicationDbContext).Assembly.FullName);
        dbContext.Database.IsNpgsql().Should().BeTrue();
    }

    #endregion

    #region 2. Edge Case Tests

    [Theory]
    [InlineData("Host=localhost;Port=5432;Database=TemplateLandingPageDb;Username=postgres;Password=postgres;Timeout=45;Application Name=LandingPageTestApp;")]
    [InlineData("Host=127.0.0.1;Port=5432;Database=TestDb;Username=postgres;Password=P@ssw0rd123;Command Timeout=120;")]
    [InlineData("Host=db.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=secret;SSL Mode=Require;Trust Server Certificate=true;")]
    public void AddPersistence_WhenConnectionStringHasCustomOptions_ShouldResolveSuccessfully(string customConnectionString)
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(customConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        dbContext.Should().NotBeNull();
        dbContext.Database.ProviderName.Should().Be("Npgsql.EntityFrameworkCore.PostgreSQL");
        dbContext.Database.GetDbConnection().ConnectionString.Should().Be(customConnectionString);

        // Repositories resolve cleanly
        scope.ServiceProvider.GetRequiredService<IUnitOfWork>().Should().NotBeNull();
        scope.ServiceProvider.GetRequiredService<ITemplateRepository>().Should().NotBeNull();
    }

    [Fact]
    public void AddPersistence_WhenConfigurationMockSectionHasDifferentValues_ShouldUseConfiguredConnection()
    {
        // Arrange
        var services = new ServiceCollection();
        var mockSection = new Mock<IConfigurationSection>();
        mockSection.Setup(s => s["DefaultConnection"])
            .Returns("Host=localhost;Port=5432;Database=SpecialDb;Username=postgres;Password=postgres;");

        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c.GetSection("ConnectionStrings"))
            .Returns(mockSection.Object);

        // Act
        services.AddPersistence(mockConfig.Object);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        dbContext.Database.GetDbConnection().ConnectionString.Should().Contain("SpecialDb");
    }

    [Theory]
    [InlineData("Host=db.supabase.co;Port=6543;Database=postgres;Username=postgres;Password=secret;SSL Mode=Require;Trust Server Certificate=true;Pooling=true;Minimum Pool Size=0;Maximum Pool Size=10;")]
    [InlineData("Host=[::1];Port=5432;Database=TemplateLandingPageDb;Username=postgres;Password=postgres;")]
    [InlineData("Host=localhost;Port=5432;Database=TemplateLandingPageDb;Username=postgres;Password=postgres;Include Error Detail=true;")]
    public void AddPersistence_WhenConnectionStringHasSupabaseAndNetworkVariants_ShouldConfigureCorrectly(string customConnectionString)
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(customConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        dbContext.Should().NotBeNull();
        dbContext.Database.IsNpgsql().Should().BeTrue();
        dbContext.Database.GetDbConnection().ConnectionString.Should().Be(customConnectionString);
    }

    #endregion

    #region 3. Failure Path Tests

    [Fact]
    public void AddPersistence_WhenConfigurationIsNull_ShouldResolveDbContextWithEmptyConnectionString()
    {
        // Arrange
        var services = new ServiceCollection();

        // Act
        services.AddPersistence(null!);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert - ConfigurationExtensions.GetConnectionString handles null configuration gracefully
        dbContext.Database.GetDbConnection().ConnectionString.Should().BeEmpty();
    }

    [Fact]
    public void AddPersistence_WhenConnectionStringsSectionIsMissing_ShouldProduceEmptyConnectionString()
    {
        // Arrange: Configuration where DefaultConnection is missing (null)
        var services = new ServiceCollection();
        var emptyConfig = CreateConfiguration(connectionString: null);

        // Act
        services.AddPersistence(emptyConfig);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        // In EF Core, if connectionString is null or missing, GetDbConnection().ConnectionString is empty string
        dbContext.Database.GetDbConnection().ConnectionString.Should().BeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void AddPersistence_WhenConnectionStringIsEmptyOrWhitespace_ShouldStoreValueAsConfigured(string emptyOrWhitespace)
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(emptyOrWhitespace);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert: EF Core preserves or trims empty/whitespace connection string
        dbContext.Database.GetDbConnection().ConnectionString.Trim().Should().BeEmpty();
    }

    [Fact]
    public void AddPersistence_WhenConnectionStringIsEmpty_OpeningConnectionShouldFail()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(string.Empty);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        var act = () => dbContext.Database.OpenConnection();
        act.Should().Throw<InvalidOperationException>();
    }

    [Theory]
    [InlineData("Host=localhost;Port=not_a_valid_port;Database=test;")]
    [InlineData("Host=localhost;Port=5432;Database=test;UnknownCustomKeyword=bad_value;")]
    public void AddPersistence_WhenConnectionStringHasInvalidSyntax_ShouldFailWhenAccessingConnection(string invalidConnectionString)
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(invalidConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert: Npgsql parses connection string upon opening or creating connection
        var act = () => dbContext.Database.OpenConnection();
        act.Should().Throw<ArgumentException>();
    }

    #endregion
}
