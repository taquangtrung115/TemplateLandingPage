namespace TemplateLandingPage.Architecture.Tests;

using FluentAssertions;
using NetArchTest.Rules;
using Xunit;

public class ArchitectureTests
{
    private const string DomainNamespace = "TemplateLandingPage.Domain";
    private const string ContractNamespace = "TemplateLandingPage.Contract";
    private const string ApplicationNamespace = "TemplateLandingPage.Application";
    private const string PersistenceNamespace = "TemplateLandingPage.Persistence";
    private const string InfrastructureNamespace = "TemplateLandingPage.Infrastructure";
    private const string PresentationNamespace = "TemplateLandingPage.Presentation";
    private const string ApiNamespace = "TemplateLandingPage.API";

    [Fact]
    public void Domain_Should_Not_HaveDependencyOnOtherProjects()
    {
        // Arrange
        var assembly = typeof(TemplateLandingPage.Domain.Abstractions.IDomainEvent).Assembly;

        var otherProjects = new[]
        {
            ContractNamespace,
            ApplicationNamespace,
            PersistenceNamespace,
            InfrastructureNamespace,
            PresentationNamespace,
            ApiNamespace
        };

        // Act
        var result = Types.InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(otherProjects)
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Contract_Should_Not_HaveDependencyOnCoreProjects()
    {
        // Arrange
        var assembly = typeof(TemplateLandingPage.Contract.Abstractions.Shared.Result).Assembly;

        var otherProjects = new[]
        {
            DomainNamespace,
            ApplicationNamespace,
            PersistenceNamespace,
            InfrastructureNamespace,
            PresentationNamespace,
            ApiNamespace
        };

        // Act
        var result = Types.InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(otherProjects)
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Application_Should_Not_HaveDependencyOnOuterLayers()
    {
        // Arrange
        var assembly = typeof(TemplateLandingPage.Application.Abstractions.ICommandHandler<>).Assembly;

        var outerProjects = new[]
        {
            PersistenceNamespace,
            InfrastructureNamespace,
            PresentationNamespace,
            ApiNamespace
        };

        // Act
        var result = Types.InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(outerProjects)
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Handlers_Should_Have_NameEndingWith_Handler()
    {
        // Arrange
        var assembly = typeof(TemplateLandingPage.Application.Abstractions.ICommandHandler<>).Assembly;

        // Act
        var result = Types.InAssembly(assembly)
            .That()
            .AreClasses()
            .And()
            .ImplementInterface(typeof(MediatR.IRequestHandler<,>))
            .Should()
            .HaveNameEndingWith("Handler")
            .GetResult();

        // Assert
        var failing = result.FailingTypeNames != null ? string.Join(", ", result.FailingTypeNames) : string.Empty;
        result.IsSuccessful.Should().BeTrue(because: failing);
    }

    [Fact]
    public void Presentation_Should_Not_HaveDirectDependencyOn_DbContext()
    {
        // Arrange
        var assembly = typeof(TemplateLandingPage.Presentation.Abstractions.IEndpoint).Assembly;

        // Act
        var result = Types.InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOn(PersistenceNamespace)
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Validators_Should_Have_NameEndingWith_Validator()
    {
        // Arrange
        var assembly = typeof(TemplateLandingPage.Application.Abstractions.ICommandHandler<>).Assembly;

        // Act
        var result = Types.InAssembly(assembly)
            .That()
            .AreClasses()
            .And()
            .ImplementInterface(typeof(FluentValidation.IValidator))
            .Should()
            .HaveNameEndingWith("Validator")
            .GetResult();

        // Assert
        var failing = result.FailingTypeNames != null ? string.Join(", ", result.FailingTypeNames) : string.Empty;
        result.IsSuccessful.Should().BeTrue(because: failing);
    }

    [Fact]
    public void Validators_Should_ResideIn_ValidatorsNamespace()
    {
        // Arrange
        var assembly = typeof(TemplateLandingPage.Application.Abstractions.ICommandHandler<>).Assembly;

        // Act
        var result = Types.InAssembly(assembly)
            .That()
            .AreClasses()
            .And()
            .ImplementInterface(typeof(FluentValidation.IValidator))
            .Should()
            .ResideInNamespaceMatching(@".*\.Validators$")
            .GetResult();

        // Assert
        var failing = result.FailingTypeNames != null ? string.Join(", ", result.FailingTypeNames) : string.Empty;
        result.IsSuccessful.Should().BeTrue(because: failing);
    }
}

