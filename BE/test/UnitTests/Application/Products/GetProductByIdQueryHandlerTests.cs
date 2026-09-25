namespace TemplateLandingPage.UnitTests.Application.Products;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Products.Queries;
using TemplateLandingPage.Contract.Services.V1.Products;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class GetProductByIdQueryHandlerTests
{
    private readonly Mock<IProductRepository> _productRepositoryMock;
    private readonly GetProductByIdQueryHandler _handler;

    public GetProductByIdQueryHandlerTests()
    {
        _productRepositoryMock = new Mock<IProductRepository>();
        _handler = new GetProductByIdQueryHandler(_productRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnProductResponse_WhenProductExists()
    {
        // Arrange
        var product = Product.Create("Smart Watch", "Fitness tracker", 199.99m);
        var query = new GetProductByIdQuery(product.Id);

        _productRepositoryMock.Setup(r => r.GetVisibleByIdAsync(product.Id, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(product.Id);
        result.Value.Name.Should().Be("Smart Watch");
        result.Value.Description.Should().Be("Fitness tracker");
        result.Value.Price.Should().Be(199.99m);
        result.Value.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenProductDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var query = new GetProductByIdQuery(nonExistentId);

        _productRepositoryMock.Setup(r => r.GetVisibleByIdAsync(nonExistentId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(ProductErrors.NotFound);
    }
}
