namespace TemplateLandingPage.UnitTests.Application.Auth;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Auth.Commands;
using TemplateLandingPage.Contract.Services.V1.Auth;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class RegisterCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _passwordHasherMock = new Mock<IPasswordHasher>();

        _handler = new RegisterCommandHandler(
            _userRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _passwordHasherMock.Object);
    }

    [Fact]
    public async Task Handle_Should_RegisterUser_WhenEmailIsUnique()
    {
        // Arrange
        var command = new RegisterCommand("newuser@template.com", "Password123!", "New User");
        _userRepositoryMock.Setup(r => r.ExistsByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _passwordHasherMock.Setup(h => h.HashPassword(command.Password))
            .Returns("hashed_pwd");
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _userRepositoryMock.Verify(r => r.Add(It.Is<User>(u => u.Email == command.Email && u.FullName == command.FullName)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenEmailAlreadyExists()
    {
        // Arrange
        var command = new RegisterCommand("existing@template.com", "Password123!", "Existing User");
        _userRepositoryMock.Setup(r => r.ExistsByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(AuthErrors.DuplicateEmail);
    }
}
