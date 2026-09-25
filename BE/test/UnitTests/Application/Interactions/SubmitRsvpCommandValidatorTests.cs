namespace TemplateLandingPage.UnitTests.Application.Interactions;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Interactions.Validators;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using Xunit;

public class SubmitRsvpCommandValidatorTests
{
    private readonly SubmitRsvpCommandValidator _validator;

    public SubmitRsvpCommandValidatorTests()
    {
        _validator = new SubmitRsvpCommandValidator();
    }

    [Fact]
    public void Validate_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new SubmitRsvpCommand(Guid.NewGuid(), Guid.NewGuid(), "Guest", null, null, "Attending", 1, null, null);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenGuestNameIsEmpty(string? guestName)
    {
        // Arrange
        var command = new SubmitRsvpCommand(Guid.NewGuid(), Guid.NewGuid(), guestName!, null, null, "Attending", 1, null, null);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SubmitRsvpCommand.GuestName));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_Should_Fail_WhenNumberOfGuestsIsLessThanOne(int count)
    {
        // Arrange
        var command = new SubmitRsvpCommand(Guid.NewGuid(), Guid.NewGuid(), "Guest", null, null, "Attending", count, null, null);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SubmitRsvpCommand.NumberOfGuests));
    }

    [Fact]
    public void Validate_Should_Pass_WhenNumberOfGuestsIsBoundaryOne()
    {
        // Arrange
        var command = new SubmitRsvpCommand(Guid.NewGuid(), Guid.NewGuid(), "Guest", null, null, "Declining", 1, null, null);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_Should_Fail_WhenVersionIsMissing()
    {
        var result = _validator.Validate(new SubmitRsvpCommand(null, Guid.NewGuid(), "Guest", null, null, "Attending", 1, null, null));

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SubmitRsvpCommand.CustomizationVersionId));
    }
}
