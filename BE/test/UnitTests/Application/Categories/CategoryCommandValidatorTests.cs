namespace TemplateLandingPage.UnitTests.Application.Categories;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Categories.Commands;
using TemplateLandingPage.Contract.Services.V1.Categories;
using Xunit;

public class CategoryCommandValidatorTests
{
    private readonly CreateCategoryCommandValidator _createValidator;
    private readonly UpdateCategoryCommandValidator _updateValidator;

    public CategoryCommandValidatorTests()
    {
        _createValidator = new CreateCategoryCommandValidator();
        _updateValidator = new UpdateCategoryCommandValidator();
    }

    [Fact]
    public void CreateCategoryValidator_Should_Pass_WhenCommandIsValid()
    {
        var command = new CreateCategoryCommand("Đám Cưới", "dam-cuoi", "Mô tả", "Heart", 1, true);
        var result = _createValidator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateCategoryValidator_Should_Fail_WhenNameIsEmpty(string? name)
    {
        var command = new CreateCategoryCommand(name!, "dam-cuoi", null, null, 1, true);
        var result = _createValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCategoryCommand.Name));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateCategoryValidator_Should_Fail_WhenSlugIsEmpty(string? slug)
    {
        var command = new CreateCategoryCommand("Đám Cưới", slug!, null, null, 1, true);
        var result = _createValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCategoryCommand.Slug));
    }

    [Fact]
    public void UpdateCategoryValidator_Should_Pass_WhenCommandIsValid()
    {
        var command = new UpdateCategoryCommand(Guid.NewGuid(), "Đám Cưới", "dam-cuoi", "Mô tả", "Heart", 1, true);
        var result = _updateValidator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateCategoryValidator_Should_Fail_WhenIdIsEmpty()
    {
        var command = new UpdateCategoryCommand(Guid.Empty, "Đám Cưới", "dam-cuoi", null, null, 1, true);
        var result = _updateValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateCategoryCommand.Id));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateCategoryValidator_Should_Fail_WhenNameIsEmpty(string? name)
    {
        var command = new UpdateCategoryCommand(Guid.NewGuid(), name!, "dam-cuoi", null, null, 1, true);
        var result = _updateValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateCategoryCommand.Name));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateCategoryValidator_Should_Fail_WhenSlugIsEmpty(string? slug)
    {
        var command = new UpdateCategoryCommand(Guid.NewGuid(), "Đám Cưới", slug!, null, null, 1, true);
        var result = _updateValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateCategoryCommand.Slug));
    }
}
