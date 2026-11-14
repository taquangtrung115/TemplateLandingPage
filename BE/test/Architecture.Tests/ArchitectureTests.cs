namespace OnePortal.Architecture.Tests;

using FluentAssertions;
using NetArchTest.Rules;
using Xunit;

public class ArchitectureTests
{
    private const string DomainNamespace = "OnePortal.Domain";
    private const string ContractNamespace = "OnePortal.Contract";
    private const string ApplicationNamespace = "OnePortal.Application";
    private const string PersistenceNamespace = "OnePortal.Persistence";
    private const string InfrastructureNamespace = "OnePortal.Infrastructure";
    private const string PresentationNamespace = "OnePortal.Presentation";
    private const string ApiNamespace = "OnePortal.API";

    [Fact]
    public void Domain_Should_Not_HaveDependencyOnOtherProjects()
    {
        // Arrange
        var assembly = typeof(OnePortal.Domain.Abstractions.IDomainEvent).Assembly;

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
        var assembly = typeof(OnePortal.Contract.Abstractions.Shared.Result).Assembly;

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
        var assembly = typeof(OnePortal.Application.Abstractions.ICommandHandler<>).Assembly;

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
        var assembly = typeof(OnePortal.Application.Abstractions.ICommandHandler<>).Assembly;

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
        var assembly = typeof(OnePortal.Presentation.Abstractions.IEndpoint).Assembly;

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
        var assembly = typeof(OnePortal.Application.Abstractions.ICommandHandler<>).Assembly;

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
        var assembly = typeof(OnePortal.Application.Abstractions.ICommandHandler<>).Assembly;

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

