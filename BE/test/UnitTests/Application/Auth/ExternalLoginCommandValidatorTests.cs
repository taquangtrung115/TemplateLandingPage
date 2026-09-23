namespace TemplateLandingPage.UnitTests.Application.Auth;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Auth.Validators;
using TemplateLandingPage.Contract.Services.V1.Auth;
using Xunit;

public class ExternalLoginCommandValidatorTests
{
    private readonly ExternalLoginCommandValidator _validator;

    public ExternalLoginCommandValidatorTests()
    {
        _validator = new ExternalLoginCommandValidator();
    }

    [Theory]
    [InlineData("Google")]
    [InlineData("google")]
    [InlineData("Facebook")]
    [InlineData("FACEBOOK")]
    public void Validator_Should_Pass_WhenValidProvider(string provider)
    {
        var command = new ExternalLoginCommand(provider, "test@example.com", "Test User");
        var result = _validator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Github")]
    [InlineData("Twitter")]
    [InlineData("Apple")]
    public void Validator_Should_Fail_WhenInvalidProvider(string provider)
    {
        var command = new ExternalLoginCommand(provider, "test@example.com", "Test User");
        var result = _validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(ExternalLoginCommand.Provider));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("invalid-email")]
    [InlineData("user@")]
    public void Validator_Should_Fail_WhenInvalidEmail(string email)
    {
        var command = new ExternalLoginCommand("Google", email, "Test User");
        var result = _validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(ExternalLoginCommand.Email));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validator_Should_Fail_WhenInvalidFullName(string fullName)
    {
        var command = new ExternalLoginCommand("Google", "test@example.com", fullName);
        var result = _validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(ExternalLoginCommand.FullName));
    }
}
