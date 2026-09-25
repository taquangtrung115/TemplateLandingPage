namespace TemplateLandingPage.UnitTests.Application.Interactions;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Interactions.Commands;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using TemplateLandingPage.Domain.ReadModels;
using Xunit;

public class SubmitGuestbookCommandHandlerTests
{
    private readonly Mock<IGuestbookRepository> _guestbookRepositoryMock;
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly SubmitGuestbookCommandHandler _handler;

    public SubmitGuestbookCommandHandlerTests()
    {
        _guestbookRepositoryMock = new Mock<IGuestbookRepository>();
        _customizationRepositoryMock = new Mock<ICustomizationRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new SubmitGuestbookCommandHandler(
            _guestbookRepositoryMock.Object,
            _customizationRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateGuestbookEntry_And_ReturnId_WhenValid()
    {
        // Arrange
        var customizationId = Guid.NewGuid();
        var versionId = Guid.NewGuid();
        _customizationRepositoryMock.Setup(r => r.GetPublicVersionAsync(versionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PublishedCustomization(customizationId, versionId, 1, Guid.NewGuid(), "Wedding", "wedding", "{\"wishes\":{\"enabled\":true}}"));

        var command = new SubmitGuestbookCommand(
            versionId,
            customizationId,
            "Le Thi B",
            "Chúc hai bạn trăm năm hạnh phúc!");

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);

        _guestbookRepositoryMock.Verify(r => r.Add(It.Is<GuestbookEntry>(g =>
            g.CustomizationVersionId == versionId && g.CustomizationId == customizationId &&
            g.SenderName == "Le Thi B" && g.Message == "Chúc hai bạn trăm năm hạnh phúc!")), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_RejectGuestbookSubmissionWithoutVersion()
    {
        var result = await _handler.Handle(
            new SubmitGuestbookCommand(null, Guid.NewGuid(), "Friend", "Best wishes"),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(InteractionErrors.VersionRequired);
        _guestbookRepositoryMock.Verify(r => r.Add(It.IsAny<GuestbookEntry>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_RejectGuestbookSubmissionWhenPublicVersionHasFeatureDisabled()
    {
        var versionId = Guid.NewGuid();
        _customizationRepositoryMock.Setup(r => r.GetPublicVersionAsync(versionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PublishedCustomization(Guid.NewGuid(), versionId, 1, Guid.NewGuid(), "Wedding", "wedding", "{\"wishes\":{\"enabled\":false}}"));

        var result = await _handler.Handle(
            new SubmitGuestbookCommand(versionId, null, "Friend", "Best wishes"),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(InteractionErrors.FeatureDisabled);
        _guestbookRepositoryMock.Verify(r => r.Add(It.IsAny<GuestbookEntry>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
