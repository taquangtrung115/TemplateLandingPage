namespace TemplateLandingPage.UnitTests.Application.Users;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Users.Commands.Validators;
using TemplateLandingPage.Contract.Services.V1.Users;
using Xunit;

public class UserCommandValidatorTests
{
    private readonly CreateUserCommandValidator _createValidator;
    private readonly UpdateUserCommandValidator _updateValidator;

    public UserCommandValidatorTests()
    {
        _createValidator = new CreateUserCommandValidator();
        _updateValidator = new UpdateUserCommandValidator();
    }

    [Fact]
    public void CreateUserValidator_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateUserCommand("user@example.com", "Password123!", "Admin User", "Admin");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateUserValidator_Should_Pass_WhenPasswordIsBoundaryLengthOfSix()
    {
        // Arrange
        var command = new CreateUserCommand("user@example.com", "123456", "Admin User", "Admin");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateUserValidator_Should_Fail_WhenEmailIsEmpty(string? email)
    {
        // Arrange
        var command = new CreateUserCommand(email!, "Password123!", "Admin User", "Admin");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateUserCommand.Email));
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("user@")]
    [InlineData("@example.com")]
    public void CreateUserValidator_Should_Fail_WhenEmailIsInvalidFormat(string email)
    {
        // Arrange
        var command = new CreateUserCommand(email, "Password123!", "Admin User", "Admin");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateUserCommand.Email));
    }

    [Theory]
    [InlineData("")]
    [InlineData("12345")]
    public void CreateUserValidator_Should_Fail_WhenPasswordIsTooShort(string password)
    {
        // Arrange
        var command = new CreateUserCommand("user@example.com", password, "Admin User", "Admin");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateUserCommand.Password));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateUserValidator_Should_Fail_WhenFullNameIsEmpty(string? fullName)
    {
        // Arrange
        var command = new CreateUserCommand("user@example.com", "Password123!", fullName!, "Admin");

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateUserCommand.FullName));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void CreateUserValidator_Should_Fail_WhenRoleIsEmpty(string? role)
    {
        // Arrange
        var command = new CreateUserCommand("user@example.com", "Password123!", "Admin User", role!);

        // Act
        var result = _createValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateUserCommand.Role));
    }

    [Fact]
    public void UpdateUserValidator_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new UpdateUserCommand(Guid.NewGuid(), "Admin User", "Admin", true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateUserValidator_Should_Fail_WhenIdIsEmpty()
    {
        // Arrange
        var command = new UpdateUserCommand(Guid.Empty, "Admin User", "Admin", true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateUserCommand.Id));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateUserValidator_Should_Fail_WhenFullNameIsEmpty(string? fullName)
    {
        // Arrange
        var command = new UpdateUserCommand(Guid.NewGuid(), fullName!, "Admin", true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateUserCommand.FullName));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UpdateUserValidator_Should_Fail_WhenRoleIsEmpty(string? role)
    {
        // Arrange
        var command = new UpdateUserCommand(Guid.NewGuid(), "Admin User", role!, true);

        // Act
        var result = _updateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateUserCommand.Role));
    }
}
