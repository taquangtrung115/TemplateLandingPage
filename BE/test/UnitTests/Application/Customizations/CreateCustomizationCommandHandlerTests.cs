namespace TemplateLandingPage.UnitTests.Application.Customizations;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Commands;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class CreateCustomizationCommandHandlerTests
{
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock;
    private readonly Mock<ITemplateRepository> _templateRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateCustomizationCommandHandler _handler;

    public CreateCustomizationCommandHandlerTests()
    {
        _customizationRepositoryMock = new Mock<ICustomizationRepository>();
        _templateRepositoryMock = new Mock<ITemplateRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new CreateCustomizationCommandHandler(
            _customizationRepositoryMock.Object,
            _templateRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateCustomization_WhenValid()
    {
        // Arrange
        var templateId = Guid.NewGuid();
        var template = Template.Create("T", "slug", null, "Wedding", "thumb", null, "{}");

        _templateRepositoryMock.Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);
        _customizationRepositoryMock.Setup(r => r.ExistsBySlugAsync("my-wedding", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new CreateCustomizationCommand(
            Guid.NewGuid(),
            templateId,
            "My Wedding",
            "my-wedding",
            "{}",
            true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _customizationRepositoryMock.Verify(r => r.Add(It.Is<UserCustomization>(c => c.Slug == "my-wedding")), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Succeed_WhenGuestCreatesCustomization_WithNullUserId()
    {
        // Arrange
        var templateId = Guid.NewGuid();
        var template = Template.Create("T", "slug", null, "Wedding", "thumb", null, "{}");

        _templateRepositoryMock.Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);
        _customizationRepositoryMock.Setup(r => r.ExistsBySlugAsync("guest-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new CreateCustomizationCommand(
            null, // Guest user without authentication
            templateId,
            "Guest Wedding Invitation",
            "guest-slug",
            "{\"theme\":{}}",
            true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _customizationRepositoryMock.Verify(r => r.Add(It.Is<UserCustomization>(c => 
            c.UserId == null && 
            c.Slug == "guest-slug" && 
            c.Title == "Guest Wedding Invitation")), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenTemplateDoesNotExist()
    {
        // Arrange
        var templateId = Guid.NewGuid();
        _templateRepositoryMock.Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Template?)null);

        var command = new CreateCustomizationCommand(
            null,
            templateId,
            "Title",
            "some-slug",
            "{}",
            true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(TemplateErrors.NotFound);
        _customizationRepositoryMock.Verify(r => r.Add(It.IsAny<UserCustomization>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnDuplicateSlug_WhenSlugAlreadyExists()
    {
        // Arrange
        var templateId = Guid.NewGuid();
        var template = Template.Create("T", "slug", null, "Wedding", "thumb", null, "{}");

        _templateRepositoryMock.Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);
        _customizationRepositoryMock.Setup(r => r.ExistsBySlugAsync("existing-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new CreateCustomizationCommand(
            null,
            templateId,
            "Title",
            "existing-slug",
            "{}",
            true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.DuplicateSlug);
        _customizationRepositoryMock.Verify(r => r.Add(It.IsAny<UserCustomization>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
