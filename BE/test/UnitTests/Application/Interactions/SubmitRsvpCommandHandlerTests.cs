namespace OnePortal.UnitTests.Application.Interactions;

using FluentAssertions;
using Moq;
using OnePortal.Application.UseCases.V1.Interactions.Commands;
using OnePortal.Contract.Services.V1.Interactions;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;
using OnePortal.Domain.ReadModels;
using Xunit;

public class SubmitRsvpCommandHandlerTests
{
    private readonly Mock<IRsvpRepository> _rsvpRepositoryMock;
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly SubmitRsvpCommandHandler _handler;

    public SubmitRsvpCommandHandlerTests()
    {
        _rsvpRepositoryMock = new Mock<IRsvpRepository>();
        _customizationRepositoryMock = new Mock<ICustomizationRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new SubmitRsvpCommandHandler(
            _rsvpRepositoryMock.Object,
            _customizationRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateRsvpEntry_And_ReturnId_WhenValid()
    {
        // Arrange
        var customizationId = Guid.NewGuid();
        var versionId = Guid.NewGuid();
        _customizationRepositoryMock.Setup(r => r.GetPublicVersionAsync(versionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PublishedCustomization(customizationId, versionId, 1, Guid.NewGuid(), "Wedding", "wedding", "{\"rsvp\":{\"enabled\":true}}"));

        var command = new SubmitRsvpCommand(
            versionId,
            customizationId,
            "Nguyen Van A",
            "a@gmail.com",
            "0901234567",
            "Attending",
            2,
            "No seafood",
            "Best wishes!");

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);

        _rsvpRepositoryMock.Verify(r => r.Add(It.Is<RsvpEntry>(e =>
            e.CustomizationVersionId == versionId && e.CustomizationId == customizationId &&
            e.GuestName == "Nguyen Van A" && e.NumberOfGuests == 2)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_RejectRsvpSubmissionWithoutVersion()
    {
        var result = await _handler.Handle(
            new SubmitRsvpCommand(null, Guid.NewGuid(), "Guest", null, null, "attending", 1, null, null),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(InteractionErrors.VersionRequired);
        _rsvpRepositoryMock.Verify(r => r.Add(It.IsAny<RsvpEntry>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
