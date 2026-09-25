namespace TemplateLandingPage.UnitTests.Application.Interactions;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Interactions.Validators;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using Xunit;

public class SubmitGuestbookCommandValidatorTests
{
    private readonly SubmitGuestbookCommandValidator _validator;

    public SubmitGuestbookCommandValidatorTests()
    {
        _validator = new SubmitGuestbookCommandValidator();
    }

    [Fact]
    public void Validate_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new SubmitGuestbookCommand(Guid.NewGuid(), Guid.NewGuid(), "Friend", "Happy Wedding!");

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenSenderNameIsEmpty(string? name)
    {
        // Arrange
        var command = new SubmitGuestbookCommand(Guid.NewGuid(), Guid.NewGuid(), name!, "Happy Wedding!");

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SubmitGuestbookCommand.SenderName));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenMessageIsEmpty(string? msg)
    {
        // Arrange
        var command = new SubmitGuestbookCommand(Guid.NewGuid(), Guid.NewGuid(), "Friend", msg!);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SubmitGuestbookCommand.Message));
    }

    [Fact]
    public void Validate_Should_Fail_WhenVersionIsMissing()
    {
        var result = _validator.Validate(new SubmitGuestbookCommand(null, Guid.NewGuid(), "Friend", "Happy Wedding!"));

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SubmitGuestbookCommand.CustomizationVersionId));
    }
}
