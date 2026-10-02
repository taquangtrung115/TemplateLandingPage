namespace TemplateLandingPage.UnitTests.Application.NavigationMenus;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Commands.Validators;
using TemplateLandingPage.Contract.Services.V1.NavigationMenus;
using Xunit;

public class NavigationMenuCommandValidatorTests
{
    private readonly CreateNavigationMenuCommandValidator _createValidator;
    private readonly UpdateNavigationMenuCommandValidator _updateValidator;

    public NavigationMenuCommandValidatorTests()
    {
        _createValidator = new CreateNavigationMenuCommandValidator();
        _updateValidator = new UpdateNavigationMenuCommandValidator();
    }

    [Fact]
    public void CreateNavigationMenuValidator_Should_Pass_WhenCommandIsValid()
    {
        var command = new CreateNavigationMenuCommand("Trang Chủ", "/", null, 1, "_self", null, null, "Home", true);
        var result = _createValidator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateNavigationMenuValidator_Should_Fail_WhenTitleIsEmpty(string? title)
    {
        var command = new CreateNavigationMenuCommand(title!, "/", null, 1, "_self", null, null, null, true);
        var result = _createValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateNavigationMenuCommand.Title));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateNavigationMenuValidator_Should_Fail_WhenUrlIsEmpty(string? url)
    {
        var command = new CreateNavigationMenuCommand("Trang Chủ", url!, null, 1, "_self", null, null, null, true);
        var result = _createValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateNavigationMenuCommand.Url));
    }

    [Fact]
    public void UpdateNavigationMenuValidator_Should_Pass_WhenCommandIsValid()
    {
        var command = new UpdateNavigationMenuCommand(Guid.NewGuid(), "Trang Chủ", "/", null, 1, "_self", null, null, null, true);
        var result = _updateValidator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateNavigationMenuValidator_Should_Fail_WhenIdIsEmpty()
    {
        var command = new UpdateNavigationMenuCommand(Guid.Empty, "Trang Chủ", "/", null, 1, "_self", null, null, null, true);
        var result = _updateValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateNavigationMenuCommand.Id));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateNavigationMenuValidator_Should_Fail_WhenTitleIsEmpty(string? title)
    {
        var command = new UpdateNavigationMenuCommand(Guid.NewGuid(), title!, "/", null, 1, "_self", null, null, null, true);
        var result = _updateValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateNavigationMenuCommand.Title));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateNavigationMenuValidator_Should_Fail_WhenUrlIsEmpty(string? url)
    {
        var command = new UpdateNavigationMenuCommand(Guid.NewGuid(), "Trang Chủ", url!, null, 1, "_self", null, null, null, true);
        var result = _updateValidator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateNavigationMenuCommand.Url));
    }
}
