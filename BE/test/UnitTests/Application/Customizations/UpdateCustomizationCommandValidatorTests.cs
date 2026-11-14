namespace OnePortal.UnitTests.Application.Customizations;

using FluentAssertions;
using OnePortal.Application.UseCases.V1.Customizations.Commands.Validators;
using OnePortal.Contract.Services.V1.Customizations;
using Xunit;

public class UpdateCustomizationCommandValidatorTests
{
    private readonly UpdateCustomizationCommandValidator _validator;

    public UpdateCustomizationCommandValidatorTests()
    {
        _validator = new UpdateCustomizationCommandValidator();
    }

    [Fact]
    public void Validate_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new UpdateCustomizationCommand(
            Guid.NewGuid(),
            "Title",
            "slug",
            "{}",
            false,
            Guid.NewGuid(),
            "User",
            1,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_Should_Fail_WhenIdIsEmpty()
    {
        // Arrange
        var command = new UpdateCustomizationCommand(
            Guid.Empty,
            "Title",
            "slug",
            "{}",
            false,
            Guid.NewGuid(),
            "User",
            1,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateCustomizationCommand.Id));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenTitleIsEmpty(string? title)
    {
        // Arrange
        var command = new UpdateCustomizationCommand(
            Guid.NewGuid(),
            title!,
            "slug",
            "{}",
            false,
            Guid.NewGuid(),
            "User",
            1,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateCustomizationCommand.Title));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenSlugIsEmpty(string? slug)
    {
        // Arrange
        var command = new UpdateCustomizationCommand(
            Guid.NewGuid(),
            "Title",
            slug!,
            "{}",
            false,
            Guid.NewGuid(),
            "User",
            1,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateCustomizationCommand.Slug));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenConfigJsonIsEmpty(string? json)
    {
        // Arrange
        var command = new UpdateCustomizationCommand(
            Guid.NewGuid(),
            "Title",
            "slug",
            json!,
            false,
            Guid.NewGuid(),
            "User",
            1,
            Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateCustomizationCommand.ConfigJson));
    }
}
