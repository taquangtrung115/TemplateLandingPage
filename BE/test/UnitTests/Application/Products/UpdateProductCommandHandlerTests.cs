namespace OnePortal.UnitTests.Application.Products;

using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using OnePortal.Application.UseCases.V1.Products.Commands;
using OnePortal.Contract.Services.V1.Products;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;
using Xunit;

public class UpdateProductCommandHandlerTests
{
    private readonly Mock<IProductRepository> _productRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<UpdateProductCommandHandler>> _loggerMock;
    private readonly UpdateProductCommandHandler _handler;

    public UpdateProductCommandHandlerTests()
    {
        _productRepositoryMock = new Mock<IProductRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<UpdateProductCommandHandler>>();

        _handler = new UpdateProductCommandHandler(
            _productRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_WhenProductExistsAndInputIsValid()
    {
        // Arrange
        var product = Product.Create("Old Product", "Old Desc", 50m);
        var command = new UpdateProductCommand(product.Id, "Updated Product", "Updated Desc", 99.99m, false);

        _productRepositoryMock.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        product.Name.Should().Be("Updated Product");
        product.Description.Should().Be("Updated Desc");
        product.Price.Should().Be(99.99m);
        product.IsActive.Should().BeFalse();

        _productRepositoryMock.Verify(r => r.Update(product), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenProductDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var command = new UpdateProductCommand(nonExistentId, "Name", "Desc", 50m, true);

        _productRepositoryMock.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(ProductErrors.NotFound);

        _productRepositoryMock.Verify(r => r.Update(It.IsAny<Product>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
