namespace TemplateLandingPage.UnitTests.Application.Products;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Products.Commands.Validators;
using TemplateLandingPage.Contract.Services.V1.Products;
using Xunit;

public class UpdateProductCommandValidatorTests
{
    private readonly UpdateProductCommandValidator _validator;

    public UpdateProductCommandValidatorTests()
    {
        _validator = new UpdateProductCommandValidator();
    }

    [Fact]
    public void Validate_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new UpdateProductCommand(Guid.NewGuid(), "Valid Product", "Valid Description", 100m, true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_Should_Fail_WhenIdIsEmpty()
    {
        // Arrange
        var command = new UpdateProductCommand(Guid.Empty, "Valid Product", "Valid Description", 100m, true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateProductCommand.Id));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenNameIsEmptyOrWhitespace(string? name)
    {
        // Arrange
        var command = new UpdateProductCommand(Guid.NewGuid(), name!, "Description", 50m, true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateProductCommand.Name));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_Should_Fail_WhenPriceIsZeroOrNegative(decimal price)
    {
        // Arrange
        var command = new UpdateProductCommand(Guid.NewGuid(), "Product", "Description", price, true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateProductCommand.Price));
    }
}
