namespace TemplateLandingPage.UnitTests.Application.Products;

using FluentAssertions;
using TemplateLandingPage.Application.UseCases.V1.Products.Validators;
using TemplateLandingPage.Contract.Services.V1.Products;
using Xunit;

public class CreateProductCommandValidatorTests
{
    private readonly CreateProductCommandValidator _validator;

    public CreateProductCommandValidatorTests()
    {
        _validator = new CreateProductCommandValidator();
    }

    [Fact]
    public void Validate_Should_Pass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateProductCommand("Valid Product", "Valid Description", 100m);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_Should_Pass_WhenDescriptionIsNull()
    {
        // Arrange
        var command = new CreateProductCommand("Valid Product", null, 0.01m);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_Should_Fail_WhenNameIsEmptyOrWhitespace(string? name)
    {
        // Arrange
        var command = new CreateProductCommand(name!, "Description", 50m);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductCommand.Name));
    }

    [Fact]
    public void Validate_Should_Fail_WhenNameExceeds200Characters()
    {
        // Arrange
        var longName = new string('A', 201);
        var command = new CreateProductCommand(longName, "Description", 50m);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductCommand.Name));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-99.99)]
    public void Validate_Should_Fail_WhenPriceIsZeroOrNegative(decimal price)
    {
        // Arrange
        var command = new CreateProductCommand("Product", "Description", price);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductCommand.Price));
    }

    [Fact]
    public void Validate_Should_Fail_WhenDescriptionExceeds1000Characters()
    {
        // Arrange
        var longDesc = new string('D', 1001);
        var command = new CreateProductCommand("Product", longDesc, 50m);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductCommand.Description));
    }
}
