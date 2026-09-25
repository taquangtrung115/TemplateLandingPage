namespace TemplateLandingPage.UnitTests.Application.Products;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Products.Queries;
using TemplateLandingPage.Contract.Services.V1.Products;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class GetProductsQueryHandlerTests
{
    private readonly Mock<IProductRepository> _productRepositoryMock;
    private readonly GetProductsQueryHandler _handler;

    public GetProductsQueryHandlerTests()
    {
        _productRepositoryMock = new Mock<IProductRepository>();
        _handler = new GetProductsQueryHandler(_productRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnProductsList_WhenProductsExist()
    {
        // Arrange
        var p1 = Product.Create("Product 1", "Desc 1", 100m);
        var p2 = Product.Create("Product 2", "Desc 2", 200m);

        _productRepositoryMock.Setup(r => r.GetVisibleAsync(false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Product> { p1, p2 });

        var query = new GetProductsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value[0].Name.Should().Be("Product 1");
        result.Value[1].Name.Should().Be("Product 2");
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoProductsExist()
    {
        // Arrange
        _productRepositoryMock.Setup(r => r.GetVisibleAsync(false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Product>());

        var query = new GetProductsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }
}
