namespace TemplateLandingPage.UnitTests.Application.Customizations;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Validators;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using Xunit;

public class CreateCustomizationCommandValidatorTests
{
    private readonly CreateCustomizationCommandValidator _validator;

    public CreateCustomizationCommandValidatorTests()
    {
        _validator = new CreateCustomizationCommandValidator();
    }

    [Fact]
    public void Validate_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateCustomizationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Title",
            "slug",
            "{}",
            true,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_Should_Fail_WhenTemplateIdIsEmpty()
    {
        // Arrange
        var command = new CreateCustomizationCommand(
            Guid.NewGuid(),
            Guid.Empty,
            "Title",
            "slug",
            "{}",
            true,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCustomizationCommand.TemplateId));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenSlugIsEmpty(string? slug)
    {
        // Arrange
        var command = new CreateCustomizationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Title",
            slug!,
            "{}",
            true,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCustomizationCommand.Slug));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenConfigJsonIsEmpty(string? json)
    {
        // Arrange
        var command = new CreateCustomizationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Title",
            "slug",
            json!,
            true,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCustomizationCommand.ConfigJson));
    }
}
