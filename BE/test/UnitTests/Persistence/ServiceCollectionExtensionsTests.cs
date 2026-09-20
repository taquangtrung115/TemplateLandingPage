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
    private const string DefaultLocalDbConnectionString =
        "Server=(localdb)\\mssqllocaldb;Database=TemplateLandingPageDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;";

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
        var configuration = CreateConfiguration(DefaultLocalDbConnectionString);

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
        var configuration = CreateConfiguration(DefaultLocalDbConnectionString);

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
        var configuration = CreateConfiguration(DefaultLocalDbConnectionString);

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
        var configuration = CreateConfiguration(DefaultLocalDbConnectionString);

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
    public void AddPersistence_Should_ConfigureSqlServerProviderForDbContext()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = CreateConfiguration(DefaultLocalDbConnectionString);

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        dbContext.Database.ProviderName.Should().Be("Microsoft.EntityFrameworkCore.SqlServer");
    }

    #endregion

    #region 2. Edge Case Tests

    [Theory]
    [InlineData("Server=(localdb)\\mssqllocaldb;Database=TemplateLandingPageDb;Trusted_Connection=True;Connection Timeout=45;MultipleActiveResultSets=true;Encrypt=False;Application Name=LandingPageTestApp;")]
    [InlineData("Server=127.0.0.1,1433;Database=TestDb;User Id=sa;Password=P@ssw0rd123;TrustServerCertificate=True;Command Timeout=120;")]
    [InlineData("Server=localhost;Database=CustomDb;Integrated Security=SSPI;Persist Security Info=False;")]
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
        dbContext.Database.ProviderName.Should().Be("Microsoft.EntityFrameworkCore.SqlServer");
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
            .Returns("Server=(localdb)\\specialInstance;Database=SpecialDb;Trusted_Connection=True;");

        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c.GetSection("ConnectionStrings"))
            .Returns(mockSection.Object);

        // Act
        services.AddPersistence(mockConfig.Object);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        dbContext.Database.GetDbConnection().ConnectionString.Should().Contain("specialInstance");
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

    #endregion
}
