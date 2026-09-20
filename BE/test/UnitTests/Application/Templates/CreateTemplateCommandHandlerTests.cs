namespace TemplateLandingPage.UnitTests.Application.Templates;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Templates.Commands;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class CreateTemplateCommandHandlerTests
{
    private readonly Mock<ITemplateRepository> _templateRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateTemplateCommandHandler _handler;

    public CreateTemplateCommandHandlerTests()
    {
        _templateRepositoryMock = new Mock<ITemplateRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new CreateTemplateCommandHandler(
            _templateRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateTemplate_WhenSlugIsUnique()
    {
        // Arrange
        var command = new CreateTemplateCommand(
            "Royal Gold",
            "royal-gold",
            "Mẫu tiệc cưới hoàng gia",
            "Wedding",
            "https://thumb.url",
            "/preview/royal-gold",
            "{}");

        _templateRepositoryMock.Setup(r => r.ExistsBySlugAsync(command.Slug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _templateRepositoryMock.Verify(r => r.Add(It.Is<Template>(t => t.Slug == command.Slug)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenSlugAlreadyExists()
    {
        // Arrange
        var command = new CreateTemplateCommand(
            "Royal Gold",
            "existing-slug",
            "Mẫu tiệc cưới hoàng gia",
            "Wedding",
            "https://thumb.url",
            "/preview/royal-gold",
            "{}");

        _templateRepositoryMock.Setup(r => r.ExistsBySlugAsync(command.Slug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(TemplateErrors.DuplicateSlug);
    }
}
