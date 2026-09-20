namespace TemplateLandingPage.UnitTests.Application.Products;

using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Products.Commands;
using TemplateLandingPage.Contract.Services.V1.Products;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class CreateProductCommandHandlerTests
{
    private readonly Mock<IProductRepository> _productRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<CreateProductCommandHandler>> _loggerMock;
    private readonly CreateProductCommandHandler _handler;

    public CreateProductCommandHandlerTests()
    {
        _productRepositoryMock = new Mock<IProductRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<CreateProductCommandHandler>>();

        _handler = new CreateProductCommandHandler(
            _productRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateProduct_And_ReturnSuccess_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateProductCommand("Wireless Mouse", "Ergonomic wireless mouse", 29.99m);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _productRepositoryMock.Verify(
            r => r.Add(It.Is<Product>(p => p.Name == "Wireless Mouse" && p.Price == 29.99m)),
            Times.Once);

        _unitOfWorkMock.Verify(
            u => u.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
