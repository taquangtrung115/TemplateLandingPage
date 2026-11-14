namespace OnePortal.Architecture.Tests;

using System.Reflection;
using System.Xml.Linq;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Domain.Abstractions;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Entities.Tenancy;
using OnePortal.Infrastructure.DependencyInjection.Extensions;
using OnePortal.Infrastructure.Services.Quoting;
using OnePortal.Persistence.Initialization;
using Xunit;

public sealed class TenantArchitectureTests
{
    [Fact]
    public void EveryDomainEntity_IsTenantOwned_OrAnExplicitGlobalIdentity()
    {
        var globals = new[] { typeof(User), typeof(Tenant), typeof(PlatformApplication), typeof(SystemSeedHistory) };
        var entities = typeof(User).Assembly.GetTypes().Where(type => type.IsClass && !type.IsAbstract && type.Namespace?.StartsWith("OnePortal.Domain.Entities", StringComparison.Ordinal) == true
            && type.GetProperty("Id") is not null);
        foreach (var entity in entities)
            (typeof(ITenantEntity).IsAssignableFrom(entity) || globals.Contains(entity)).Should().BeTrue(entity.FullName);
    }

    [Fact]
    public void RequestIdentityAndTenantContext_HaveNoStaticMutableState()
    {
        foreach (var type in new[] { typeof(TenantContext), typeof(RequestActor) })
            type.GetFields(BindingFlags.Static | BindingFlags.NonPublic | BindingFlags.Public).Should().BeEmpty();
    }

    [Fact]
    public void StorageServices_ThatCaptureTenantContext_AreScoped()
    {
        var services = new ServiceCollection(); services.AddInfrastructure(new ConfigurationBuilder().Build());
        services.Single(descriptor => descriptor.ServiceType == typeof(LocalStorageService)).Lifetime.Should().Be(ServiceLifetime.Scoped);
        services.Single(descriptor => descriptor.ServiceType == typeof(IQuotationFileStorageService)).Lifetime.Should().Be(ServiceLifetime.Scoped);
    }

    [Fact]
    public void EveryApplication_HasAnUnambiguousVersionedFoundationSeed()
    {
        foreach (var appKey in TenantDefaults.ApplicationKeys)
        {
            var steps = DatabaseInitializer.Steps.Where(step => step.AppKey == appKey).ToList();
            steps.Should().NotBeEmpty(); steps.Should().OnlyContain(step => step.Version > 0 && !string.IsNullOrWhiteSpace(step.Key));
            steps.Select(step => (step.Key, step.Version)).Distinct().Count().Should().Be(steps.Count);
        }
    }

    [Fact]
    public void Gateway_HasNoDependencyOnBusinessOrDatabaseProjects()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "BE", "OnePortal.sln"))) directory = directory.Parent;
        directory.Should().NotBeNull();
        var project = XDocument.Load(Path.Combine(directory!.FullName, "BE", "src", "Gateway", "OnePortal.Gateway.csproj"));
        project.Descendants("ProjectReference").Should().BeEmpty();
    }

    [Fact]
    public void QuotingModule_DoesNotCallLandingUseCases()
    {
        var result = NetArchTest.Rules.Types.InAssembly(typeof(ITenantContext).Assembly)
            .That().ResideInNamespaceMatching(@"OnePortal.Application.UseCases.V1.Quoting.*")
            .ShouldNot().HaveDependencyOnAny("OnePortal.Application.UseCases.V1.Customizations",
                "OnePortal.Application.UseCases.V1.Templates", "OnePortal.Application.UseCases.V1.Categories")
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void LandingUseCases_DoNotCallQuotingUseCases()
    {
        var result = NetArchTest.Rules.Types.InAssembly(typeof(ITenantContext).Assembly)
            .That().ResideInNamespaceMatching(@"OnePortal.Application.UseCases.V1.(Customizations|Templates|Categories|Menus|Rsvps|Guestbooks).*")
            .ShouldNot().HaveDependencyOn("OnePortal.Application.UseCases.V1.Quoting").GetResult();
        result.IsSuccessful.Should().BeTrue();
    }
}

