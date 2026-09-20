namespace TemplateLandingPage.UnitTests.Application.Interactions;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Interactions.Commands;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class SubmitGuestbookCommandHandlerTests
{
    private readonly Mock<IGuestbookRepository> _guestbookRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly SubmitGuestbookCommandHandler _handler;

    public SubmitGuestbookCommandHandlerTests()
    {
        _guestbookRepositoryMock = new Mock<IGuestbookRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new SubmitGuestbookCommandHandler(_guestbookRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateGuestbookEntry_And_ReturnId_WhenValid()
    {
        // Arrange
        var command = new SubmitGuestbookCommand(
            Guid.NewGuid(),
            "Le Thi B",
            "Chúc hai bạn trăm năm hạnh phúc!");

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _guestbookRepositoryMock.Verify(r => r.Add(It.Is<GuestbookEntry>(g => g.SenderName == "Le Thi B" && g.Message == "Chúc hai bạn trăm năm hạnh phúc!")), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
