namespace TemplateLandingPage.UnitTests.Application.Templates;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Templates.Commands;
using TemplateLandingPage.Application.UseCases.V1.Templates.Validators;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class CreateCommunityTemplateCommandHandlerTests
{
    private readonly Mock<ITemplateRepository> _templateRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateCommunityTemplateCommandHandler _handler;

    public CreateCommunityTemplateCommandHandlerTests()
    {
        _templateRepositoryMock = new Mock<ITemplateRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new CreateCommunityTemplateCommandHandler(
            _templateRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreateCommunityTemplate_WhenSlugIsUnique()
    {
        // Arrange
        var command = new CreateCommunityTemplateCommand(
            "Community Birthday",
            "comm-birthday",
            "Mẫu sinh nhật cộng đồng",
            "Birthday",
            "https://thumb.url",
            "{}",
            "Nguyen Van A");

        _templateRepositoryMock.Setup(r => r.ExistsBySlugAsync(command.Slug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _templateRepositoryMock.Verify(r => r.Add(It.Is<Template>(t =>
            t.Slug == command.Slug &&
            t.IsCommunity == true &&
            t.AuthorName == "Nguyen Van A")), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_AppendSuffixToSlug_WhenSlugAlreadyExists()
    {
        // Arrange
        var command = new CreateCommunityTemplateCommand(
            "Community Birthday",
            "existing-slug",
            "Mẫu sinh nhật cộng đồng",
            "Birthday",
            "https://thumb.url",
            "{}",
            null);

        _templateRepositoryMock.Setup(r => r.ExistsBySlugAsync("existing-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _templateRepositoryMock.Verify(r => r.Add(It.Is<Template>(t =>
            t.Slug.StartsWith("existing-slug-") &&
            t.IsCommunity == true &&
            t.AuthorName == "Anonymous")), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_StoreCreatedByUserId_WhenProvided()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new CreateCommunityTemplateCommand(
            "Community Wedding",
            "comm-wedding",
            "Mẫu cưới cộng đồng",
            "Wedding",
            "https://thumb.url",
            "{}",
            "Le Van B",
            userId);

        _templateRepositoryMock.Setup(r => r.ExistsBySlugAsync(command.Slug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _templateRepositoryMock.Verify(r => r.Add(It.Is<Template>(t =>
            t.CreatedByUserId == userId &&
            t.IsCommunity == true &&
            t.AuthorName == "Le Van B")), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_TruncateSlugTo200Chars_WhenSlugWithSuffixExceeds200Chars()
    {
        // Arrange - 198 characters slug + 6 char suffix would be 204 chars
        var longSlug = new string('a', 198);
        var command = new CreateCommunityTemplateCommand(
            "Long Slug Template",
            longSlug,
            null,
            "Tech",
            "https://thumb.url",
            "{}",
            "Author");

        _templateRepositoryMock.Setup(r => r.ExistsBySlugAsync(longSlug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _templateRepositoryMock.Verify(r => r.Add(It.Is<Template>(t =>
            t.Slug.Length <= 200)), Times.Once);
    }

    [Theory]
    [InlineData("", "slug", "Category", "https://thumb.url", "{}")]
    [InlineData("Name", "", "Category", "https://thumb.url", "{}")]
    [InlineData("Name", "slug", "", "https://thumb.url", "{}")]
    [InlineData("Name", "slug", "Category", "", "{}")]
    [InlineData("Name", "slug", "Category", "https://thumb.url", "")]
    public void Validator_Should_HaveValidationError_WhenRequiredFieldsAreEmpty(
        string name, string slug, string category, string thumbnailUrl, string defaultConfigJson)
    {
        var validator = new CreateCommunityTemplateCommandValidator();
        var command = new CreateCommunityTemplateCommand(name, slug, null, category, thumbnailUrl, defaultConfigJson, "Author");

        var result = validator.Validate(command);

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validator_Should_HaveValidationError_WhenAuthorNameExceeds150Characters()
    {
        var validator = new CreateCommunityTemplateCommandValidator();
        var command = new CreateCommunityTemplateCommand(
            "Valid Name",
            "valid-slug",
            null,
            "Valid Category",
            "https://thumb.url",
            "{}",
            new string('X', 151));

        var result = validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCommunityTemplateCommand.AuthorName));
    }

    [Fact]
    public void Validator_Should_HaveValidationError_WhenDefaultConfigJsonIsNotValidJson()
    {
        var validator = new CreateCommunityTemplateCommandValidator();
        var command = new CreateCommunityTemplateCommand(
            "Valid Name",
            "valid-slug",
            null,
            "Valid Category",
            "https://thumb.url",
            "{ not valid json syntax }",
            "Author");

        var result = validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCommunityTemplateCommand.DefaultConfigJson));
    }
}

