namespace TemplateLandingPage.UnitTests.Application.Auth;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Auth.Commands;
using TemplateLandingPage.Contract.Services.V1.Auth;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class LoginCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();

        _handler = new LoginCommandHandler(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _jwtTokenGeneratorMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnLoginResponse_WhenCredentialsAreValid()
    {
        // Arrange
        var user = User.Create("valid@template.com", "hashed_pwd", "Valid User", "User");
        _userRepositoryMock.Setup(r => r.GetByEmailAsync("valid@template.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.VerifyPassword("Password123!", "hashed_pwd"))
            .Returns(true);
        _jwtTokenGeneratorMock.Setup(g => g.GenerateToken(user))
            .Returns("sample_jwt_token");

        var command = new LoginCommand("valid@template.com", "Password123!");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("sample_jwt_token");
        result.Value.User.Email.Should().Be("valid@template.com");
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenPasswordIsIncorrect()
    {
        // Arrange
        var user = User.Create("valid@template.com", "hashed_pwd", "Valid User", "User");
        _userRepositoryMock.Setup(r => r.GetByEmailAsync("valid@template.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.VerifyPassword("WrongPassword", "hashed_pwd"))
            .Returns(false);

        var command = new LoginCommand("valid@template.com", "WrongPassword");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(AuthErrors.InvalidCredentials);
    }
}
