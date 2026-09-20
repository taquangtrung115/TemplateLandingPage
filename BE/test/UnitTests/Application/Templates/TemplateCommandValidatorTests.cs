namespace TemplateLandingPage.UnitTests.Application.Templates;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Templates.Validators;
using TemplateLandingPage.Contract.Services.V1.Templates;
using Xunit;

public class TemplateCommandValidatorTests
{
    private readonly CreateTemplateCommandValidator _createValidator;
    private readonly UpdateTemplateCommandValidator _updateValidator;

    public TemplateCommandValidatorTests()
    {
        _createValidator = new CreateTemplateCommandValidator();
        _updateValidator = new UpdateTemplateCommandValidator();
    }

    [Fact]
    public void CreateTemplateValidator_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateTemplateCommand(
            "Wedding Template",
            "wedding-template",
            "A beautiful template",
            Guid.NewGuid(),
            "Wedding",
            "https://example.com/thumb.jpg",
            null,
            null,
            "Popular",
            null,
            null,
            "{}");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateTemplateValidator_Should_Fail_WhenNameIsEmpty(string? name)
    {
        // Arrange
        var command = new CreateTemplateCommand(
            name!,
            "wedding-template",
            null,
            null,
            "Wedding",
            "https://example.com/thumb.jpg",
            null,
            null,
            null,
            null,
            null,
            "{}");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateTemplateCommand.Name));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateTemplateValidator_Should_Fail_WhenSlugIsEmpty(string? slug)
    {
        // Arrange
        var command = new CreateTemplateCommand(
            "Wedding Template",
            slug!,
            null,
            null,
            "Wedding",
            "https://example.com/thumb.jpg",
            null,
            null,
            null,
            null,
            null,
            "{}");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateTemplateCommand.Slug));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateTemplateValidator_Should_Fail_WhenCategoryIsEmpty(string? category)
    {
        // Arrange
        var command = new CreateTemplateCommand(
            "Wedding Template",
            "wedding-template",
            null,
            null,
            category!,
            "https://example.com/thumb.jpg",
            null,
            null,
            null,
            null,
            null,
            "{}");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateTemplateCommand.Category));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateTemplateValidator_Should_Fail_WhenThumbnailUrlIsEmpty(string? thumbnailUrl)
    {
        // Arrange
        var command = new CreateTemplateCommand(
            "Wedding Template",
            "wedding-template",
            null,
            null,
            "Wedding",
            thumbnailUrl!,
            null,
            null,
            null,
            null,
            null,
            "{}");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateTemplateCommand.ThumbnailUrl));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateTemplateValidator_Should_Fail_WhenDefaultConfigJsonIsEmpty(string? configJson)
    {
        // Arrange
        var command = new CreateTemplateCommand(
            "Wedding Template",
            "wedding-template",
            null,
            null,
            "Wedding",
            "https://example.com/thumb.jpg",
            null,
            null,
            null,
            null,
            null,
            configJson!);

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateTemplateCommand.DefaultConfigJson));
    }

    [Fact]
    public void UpdateTemplateValidator_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new UpdateTemplateCommand(
            Guid.NewGuid(),
            "Updated Template",
            "updated-slug",
            "Updated description",
            Guid.NewGuid(),
            "Birthday",
            "https://example.com/thumb-updated.jpg",
            null,
            null,
            null,
            null,
            null,
            "{}",
            true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateTemplateValidator_Should_Fail_WhenIdIsEmpty()
    {
        // Arrange
        var command = new UpdateTemplateCommand(
            Guid.Empty,
            "Updated Template",
            "updated-slug",
            null,
            null,
            "Birthday",
            "https://example.com/thumb-updated.jpg",
            null,
            null,
            null,
            null,
            null,
            "{}",
            true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateTemplateCommand.Id));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateTemplateValidator_Should_Fail_WhenNameIsEmpty(string? name)
    {
        // Arrange
        var command = new UpdateTemplateCommand(
            Guid.NewGuid(),
            name!,
            "updated-slug",
            null,
            null,
            "Birthday",
            "https://example.com/thumb-updated.jpg",
            null,
            null,
            null,
            null,
            null,
            "{}",
            true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateTemplateCommand.Name));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateTemplateValidator_Should_Fail_WhenSlugIsEmpty(string? slug)
    {
        // Arrange
        var command = new UpdateTemplateCommand(
            Guid.NewGuid(),
            "Updated Template",
            slug!,
            null,
            null,
            "Birthday",
            "https://example.com/thumb-updated.jpg",
            null,
            null,
            null,
            null,
            null,
            "{}",
            true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateTemplateCommand.Slug));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateTemplateValidator_Should_Fail_WhenCategoryIsEmpty(string? category)
    {
        // Arrange
        var command = new UpdateTemplateCommand(
            Guid.NewGuid(),
            "Updated Template",
            "updated-slug",
            null,
            null,
            category!,
            "https://example.com/thumb-updated.jpg",
            null,
            null,
            null,
            null,
            null,
            "{}",
            true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateTemplateCommand.Category));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateTemplateValidator_Should_Fail_WhenThumbnailUrlIsEmpty(string? thumbnailUrl)
    {
        // Arrange
        var command = new UpdateTemplateCommand(
            Guid.NewGuid(),
            "Updated Template",
            "updated-slug",
            null,
            null,
            "Birthday",
            thumbnailUrl!,
            null,
            null,
            null,
            null,
            null,
            "{}",
            true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateTemplateCommand.ThumbnailUrl));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateTemplateValidator_Should_Fail_WhenDefaultConfigJsonIsEmpty(string? configJson)
    {
        // Arrange
        var command = new UpdateTemplateCommand(
            Guid.NewGuid(),
            "Updated Template",
            "updated-slug",
            null,
            null,
            "Birthday",
            "https://example.com/thumb-updated.jpg",
            null,
            null,
            null,
            null,
            null,
            configJson!,
            true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateTemplateCommand.DefaultConfigJson));
    }
}
