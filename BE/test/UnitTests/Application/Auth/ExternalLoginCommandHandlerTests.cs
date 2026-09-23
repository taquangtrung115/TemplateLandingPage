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

public class ExternalLoginCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;
    private readonly ExternalLoginCommandHandler _handler;

    public ExternalLoginCommandHandlerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();

        _handler = new ExternalLoginCommandHandler(
            _userRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _jwtTokenGeneratorMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateNewUser_WhenUserDoesNotExist()
    {
        // Arrange
        var command = new ExternalLoginCommand("Google", "newuser@gmail.com", "New User", "https://avatar.url/1.png");

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("newuser@gmail.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        _jwtTokenGeneratorMock.Setup(g => g.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token_123");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("jwt_token_123");
        result.Value.User.Email.Should().Be("newuser@gmail.com");
        result.Value.User.FullName.Should().Be("New User");
        result.Value.User.AvatarUrl.Should().Be("https://avatar.url/1.png");
        result.Value.User.Role.Should().Be("User");

        _userRepositoryMock.Verify(r => r.Add(It.Is<User>(u => u.Email == "newuser@gmail.com" && u.Provider == "Google")), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_LinkExistingUserAndPreservePassword_WhenUserExists()
    {
        // Arrange
        var existingUser = User.Create("existing@domain.com", "existing_hashed_pwd", "Existing Name", "User");
        var command = new ExternalLoginCommand("Facebook", "Existing@Domain.com", "Existing Name", "https://fb.com/pic.jpg");

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("existing@domain.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);
        _jwtTokenGeneratorMock.Setup(g => g.GenerateToken(existingUser))
            .Returns("linked_token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("linked_token");
        existingUser.PasswordHash.Should().Be("existing_hashed_pwd"); // Original password preserved!
        existingUser.AvatarUrl.Should().Be("https://fb.com/pic.jpg");
        existingUser.Provider.Should().Be("Facebook");

        _userRepositoryMock.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenUserIsInactive()
    {
        // Arrange
        var inactiveUser = User.Create("locked@domain.com", "hashed_pwd", "Locked User", "User");
        inactiveUser.UpdateProfile("Locked User", "User", isActive: false);

        var command = new ExternalLoginCommand("Google", "locked@domain.com", "Locked User");

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("locked@domain.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(inactiveUser);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(AuthErrors.UserInactive);
        _jwtTokenGeneratorMock.Verify(g => g.GenerateToken(It.IsAny<User>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_CreateNewUser_WhenFacebookOAuthProvided_AndUserDoesNotExist()
    {
        // Arrange
        var command = new ExternalLoginCommand("Facebook", "fbuser@meta.com", "Facebook User", "https://graph.facebook.com/123/picture");

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("fbuser@meta.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        _jwtTokenGeneratorMock.Setup(g => g.GenerateToken(It.IsAny<User>()))
            .Returns("fb_jwt_token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("fb_jwt_token");
        result.Value.User.Email.Should().Be("fbuser@meta.com");
        result.Value.User.FullName.Should().Be("Facebook User");
        result.Value.User.AvatarUrl.Should().Be("https://graph.facebook.com/123/picture");
        result.Value.User.Role.Should().Be("User");

        _userRepositoryMock.Verify(r => r.Add(It.Is<User>(u =>
            u.Email == "fbuser@meta.com" &&
            u.Provider == "Facebook" &&
            u.Role == "User" &&
            u.PasswordHash.StartsWith("EXTERNAL_FACEBOOK_"))), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_NotOverwriteExistingAvatar_WhenUserAlreadyHasAvatar()
    {
        // Arrange: User has existing avatar
        var existingUser = User.Create("user@domain.com", "hash", "Existing Name", "User");
        // Simulate existing avatar via domain update
        existingUser.UpdateExternalProfile("Existing Name", "https://original.avatar/pic.jpg", "Local");

        var command = new ExternalLoginCommand("Google", "user@domain.com", "Google Name", "https://new.google.avatar/pic.jpg");

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("user@domain.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);
        _jwtTokenGeneratorMock.Setup(g => g.GenerateToken(existingUser))
            .Returns("token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        existingUser.AvatarUrl.Should().Be("https://original.avatar/pic.jpg"); // Preserved!
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_UpdateMissingAvatar_WhenUserHasNoAvatar()
    {
        // Arrange: User has no avatar initially
        var existingUser = User.Create("noavatar@domain.com", "hash", "No Avatar User", "User");
        existingUser.AvatarUrl.Should().BeNull();

        var command = new ExternalLoginCommand("Google", "noavatar@domain.com", "No Avatar User", "https://new.google.avatar/pic.jpg");

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("noavatar@domain.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);
        _jwtTokenGeneratorMock.Setup(g => g.GenerateToken(existingUser))
            .Returns("token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        existingUser.AvatarUrl.Should().Be("https://new.google.avatar/pic.jpg"); // Populated!
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_NormalizeEmail_ToLowerCaseAndTrimmed()
    {
        // Arrange
        var command = new ExternalLoginCommand("Google", "  SPACED.User@Gmail.COM  ", "Spaced User", null);

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("spaced.user@gmail.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        _jwtTokenGeneratorMock.Setup(g => g.GenerateToken(It.IsAny<User>()))
            .Returns("norm_token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _userRepositoryMock.Verify(r => r.GetByEmailAsync("spaced.user@gmail.com", It.IsAny<CancellationToken>()), Times.Once);
        _userRepositoryMock.Verify(r => r.Add(It.Is<User>(u => u.Email == "spaced.user@gmail.com")), Times.Once);
    }
}
