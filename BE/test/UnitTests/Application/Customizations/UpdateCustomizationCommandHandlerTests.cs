namespace TemplateLandingPage.UnitTests.Application.Customizations;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Commands;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class UpdateCustomizationCommandHandlerTests
{
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly UpdateCustomizationCommandHandler _handler;

    public UpdateCustomizationCommandHandlerTests()
    {
        _customizationRepositoryMock = new Mock<ICustomizationRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new UpdateCustomizationCommandHandler(
            _customizationRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenCustomizationDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);

        var command = new UpdateCustomizationCommand(
            id,
            "Updated Title",
            "updated-slug",
            "{}",
            true,
            null,
            "User");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_Succeed_WhenGuestUpdatesCustomizationWithNullUserId()
    {
        // Arrange
        var id = Guid.NewGuid();
        var customization = UserCustomization.Create(null, Guid.NewGuid(), "Guest Title", "guest-slug", "{}");

        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customization);
        _customizationRepositoryMock.Setup(r => r.GetBySlugAsync("updated-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new UpdateCustomizationCommand(
            id,
            "Updated Title",
            "updated-slug",
            "{\"theme\":{}}",
            true,
            null,
            "User");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        customization.Title.Should().Be("Updated Title");
        customization.Slug.Should().Be("updated-slug");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Succeed_WhenOwnerUpdatesOwnCustomization()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var id = Guid.NewGuid();
        var customization = UserCustomization.Create(ownerId, Guid.NewGuid(), "Owner Title", "owner-slug", "{}");

        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customization);
        _customizationRepositoryMock.Setup(r => r.GetBySlugAsync("updated-owner-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new UpdateCustomizationCommand(
            id,
            "Updated Title",
            "updated-owner-slug",
            "{\"theme\":{}}",
            true,
            ownerId,
            "User");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        customization.Title.Should().Be("Updated Title");
    }

    [Fact]
    public async Task Handle_Should_Succeed_WhenAdminUpdatesAnyCustomization()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var id = Guid.NewGuid();
        var customization = UserCustomization.Create(ownerId, Guid.NewGuid(), "User Title", "user-slug", "{}");

        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customization);
        _customizationRepositoryMock.Setup(r => r.GetBySlugAsync("admin-updated-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new UpdateCustomizationCommand(
            id,
            "Admin Title",
            "admin-updated-slug",
            "{\"theme\":{}}",
            true,
            adminId,
            "Admin");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        customization.Title.Should().Be("Admin Title");
    }

    [Fact]
    public async Task Handle_Should_ReturnUnauthorized_WhenAnotherUserTriesToUpdate()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var anotherUserId = Guid.NewGuid();
        var id = Guid.NewGuid();
        var customization = UserCustomization.Create(ownerId, Guid.NewGuid(), "User Title", "user-slug", "{}");

        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customization);

        var command = new UpdateCustomizationCommand(
            id,
            "Hacker Title",
            "hacker-slug",
            "{}",
            true,
            anotherUserId,
            "User");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.Unauthorized);
    }

    [Fact]
    public async Task Handle_Should_ReturnUnauthorized_WhenGuestTriesToUpdateRegisteredUserCustomization()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var id = Guid.NewGuid();
        var customization = UserCustomization.Create(ownerId, Guid.NewGuid(), "User Title", "user-slug", "{}");

        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customization);

        var command = new UpdateCustomizationCommand(
            id,
            "Guest Title",
            "guest-slug",
            "{}",
            true,
            null,
            "User");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.Unauthorized);
    }

    [Fact]
    public async Task Handle_Should_ReturnDuplicateSlug_WhenSlugIsUsedByAnotherCustomization()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var id = Guid.NewGuid();
        var anotherId = Guid.NewGuid();
        var customization = UserCustomization.Create(ownerId, Guid.NewGuid(), "User Title", "user-slug", "{}");
        var existingWithSlug = UserCustomization.Create(ownerId, Guid.NewGuid(), "Existing Title", "duplicate-slug", "{}");
        // Reflectively set Id on existingWithSlug or create mock
        // Since UserCustomization Id is Guid from constructor:
        // existingWithSlug.Id != id is true because new Guid was generated.

        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customization);
        _customizationRepositoryMock.Setup(r => r.GetBySlugAsync("duplicate-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingWithSlug);

        var command = new UpdateCustomizationCommand(
            id,
            "New Title",
            "duplicate-slug",
            "{}",
            true,
            ownerId,
            "User");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.DuplicateSlug);
    }
}
