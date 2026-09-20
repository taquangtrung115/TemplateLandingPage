namespace TemplateLandingPage.UnitTests.Application.Interactions;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Interactions.Commands;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class SubmitRsvpCommandHandlerTests
{
    private readonly Mock<IRsvpRepository> _rsvpRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly SubmitRsvpCommandHandler _handler;

    public SubmitRsvpCommandHandlerTests()
    {
        _rsvpRepositoryMock = new Mock<IRsvpRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new SubmitRsvpCommandHandler(_rsvpRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateRsvpEntry_And_ReturnId_WhenValid()
    {
        // Arrange
        var command = new SubmitRsvpCommand(
            Guid.NewGuid(),
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
        result.Value.Should().NotBeEmpty();

        _rsvpRepositoryMock.Verify(r => r.Add(It.Is<RsvpEntry>(e => e.GuestName == "Nguyen Van A" && e.NumberOfGuests == 2)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
