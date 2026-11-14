namespace OnePortal.UnitTests.Domain;

using FluentAssertions;
using OnePortal.Domain.Entities;
using Xunit;

public class ProductTests
{
    [Fact]
    public void Create_Should_InstantiateProduct_WhenInputsAreValid()
    {
        // Arrange & Act
        var product = Product.Create("Mechanical Keyboard", "RGB Gaming Keyboard", 89.99m);

        // Assert
        product.Id.Should().NotBeEmpty();
        product.Name.Should().Be("Mechanical Keyboard");
        product.Description.Should().Be("RGB Gaming Keyboard");
        product.Price.Should().Be(89.99m);
        product.IsActive.Should().BeTrue();
        product.IsDeleted.Should().BeFalse();
        product.DeletedAtUtc.Should().BeNull();
        product.CreatedAtUtc.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_Should_ThrowArgumentException_WhenNameIsInvalid(string? name)
    {
        // Act
        var act = () => Product.Create(name!, "Valid description", 50m);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Create_Should_ThrowArgumentException_WhenPriceIsZeroOrNegative(decimal price)
    {
        // Act
        var act = () => Product.Create("Product", "Valid description", price);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("price");
    }

    [Fact]
    public void Update_Should_ModifyProductState_WhenInputsAreValid()
    {
        // Arrange
        var product = Product.Create("Old Name", "Old Desc", 50m);

        // Act
        product.Update("New Name", "New Desc", 75m, false);

        // Assert
        product.Name.Should().Be("New Name");
        product.Description.Should().Be("New Desc");
        product.Price.Should().Be(75m);
        product.IsActive.Should().BeFalse();
        product.ModifiedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public void Delete_Should_SetIsDeletedAndDeletedAtUtc()
    {
        // Arrange
        var product = Product.Create("Product", "Desc", 50m);

        // Act
        product.Delete();

        // Assert
        product.IsDeleted.Should().BeTrue();
        product.DeletedAtUtc.Should().NotBeNull();
        product.DeletedAtUtc.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }
}
