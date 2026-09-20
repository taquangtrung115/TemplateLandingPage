namespace TemplateLandingPage.UnitTests.Application.Auth;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Auth.Commands;
using TemplateLandingPage.Contract.Services.V1.Auth;
using Xunit;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator;

    public RegisterCommandValidatorTests()
    {
        _validator = new RegisterCommandValidator();
    }

    [Fact]
    public void Validate_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new RegisterCommand("valid@example.com", "Password123!", "Valid User");

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenEmailIsEmpty(string? email)
    {
        // Arrange
        var command = new RegisterCommand(email!, "Password123!", "Valid User");

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterCommand.Email));
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("plainaddress")]
    [InlineData("@missingusername.com")]
    public void Validate_Should_Fail_WhenEmailFormatIsInvalid(string email)
    {
        // Arrange
        var command = new RegisterCommand(email, "Password123!", "Valid User");

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterCommand.Email));
    }

    [Theory]
    [InlineData("")]
    [InlineData("12345")] // less than 6 chars
    public void Validate_Should_Fail_WhenPasswordIsTooShort(string password)
    {
        // Arrange
        var command = new RegisterCommand("valid@example.com", password, "Valid User");

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterCommand.Password));
    }

    [Fact]
    public void Validate_Should_Fail_WhenFullNameExceeds100Characters()
    {
        // Arrange
        var longName = new string('N', 101);
        var command = new RegisterCommand("valid@example.com", "Password123!", longName);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterCommand.FullName));
    }
}
