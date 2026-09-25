namespace TemplateLandingPage.UnitTests.Application.Templates;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Templates.Commands;
using TemplateLandingPage.Application.UseCases.V1.Templates.Validators;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.ReadModels;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class CreateCommunityTemplateCommandHandlerTests
{
    private readonly Mock<ITemplateRepository> _templateRepositoryMock = new();
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock = new();
    private readonly Mock<ICategoryRepository> _categoryRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly CreateCommunityTemplateCommandHandler _handler;

    public CreateCommunityTemplateCommandHandlerTests() =>
        _handler = new CreateCommunityTemplateCommandHandler(
            _templateRepositoryMock.Object,
            _customizationRepositoryMock.Object,
            _categoryRepositoryMock.Object,
            _userRepositoryMock.Object,
            _unitOfWorkMock.Object);

    [Fact]
    public async Task Handle_Should_ShareSelectedSnapshotForAuthenticatedOwner()
    {
        var owner = User.Create("owner@example.test", "hash", "Owner Name");
        var category = Category.Create("Wedding", "wedding", null, null, 1);
        var source = UserCustomization.Create(owner.Id, Guid.NewGuid(), "Working", "working", "{\"hero\":{\"title\":\"working\"}}");
        var version = CustomizationVersion.Create(source, Guid.NewGuid(), "version-request-hash");
        version.Publish();
        _customizationRepositoryMock.Setup(r => r.ReadAccessAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CustomizationAccess(source.Id, owner.Id, source.Slug, null));
        _customizationRepositoryMock.Setup(r => r.ReadVersionAsync(source.Id, version.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(version);
        _categoryRepositoryMock.Setup(r => r.GetActiveByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _userRepositoryMock.Setup(r => r.GetActiveByIdAsync(owner.Id, It.IsAny<CancellationToken>())).ReturnsAsync(owner);
        _templateRepositoryMock.Setup(r => r.ExistsBySlugAsync("community-wedding", It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var result = await _handler.Handle(
            new CreateCommunityTemplateCommand(source.Id, version.Id, category.Id, "Community Wedding", "community-wedding",
                "Snapshot based", "https://example.test/thumb.png", owner.Id, false),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);
        _templateRepositoryMock.Verify(r => r.Add(It.Is<Template>(t =>
            t.Id == result.Value && t.CategoryId == category.Id && t.DefaultConfigJson == version.ConfigJson &&
            t.CreatedByUserId == owner.Id && t.AuthorName == owner.FullName && t.IsCommunity)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_RejectNonOwnerWithoutAdminRole()
    {
        var owner = Guid.NewGuid();
        var actor = User.Create("other@example.test", "hash", "Other");
        var sourceId = Guid.NewGuid();
        var versionId = Guid.NewGuid();
        _customizationRepositoryMock.Setup(r => r.ReadAccessAsync(sourceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CustomizationAccess(sourceId, owner, "owned", null));

        var result = await _handler.Handle(
            new CreateCommunityTemplateCommand(sourceId, versionId, Guid.NewGuid(), "Share", "share", null,
                "https://example.test/thumb.png", actor.Id, false),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(TemplateErrors.AccessDenied);
        _customizationRepositoryMock.Verify(r => r.ReadVersionAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
        _templateRepositoryMock.Verify(r => r.Add(It.IsAny<Template>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_AllowAdminToShareAnotherUsersVersion()
    {
        var admin = User.Create("admin@example.test", "hash", "Current Admin", "Admin");
        var source = UserCustomization.Create(Guid.NewGuid(), Guid.NewGuid(), "Snapshot title", "snapshot", "{\"hero\":{\"title\":\"published\"}}");
        var version = CustomizationVersion.Create(source, Guid.NewGuid(), "request-hash");
        var category = Category.Create("Events", "events", null, null, 2);
        _customizationRepositoryMock.Setup(r => r.ReadAccessAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CustomizationAccess(source.Id, source.UserId, source.Slug, null));
        _customizationRepositoryMock.Setup(r => r.ReadVersionAsync(source.Id, version.Id, It.IsAny<CancellationToken>())).ReturnsAsync(version);
        _categoryRepositoryMock.Setup(r => r.GetActiveByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _userRepositoryMock.Setup(r => r.GetActiveByIdAsync(admin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(admin);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var result = await _handler.Handle(
            new CreateCommunityTemplateCommand(source.Id, version.Id, category.Id, "Shared Snapshot", "shared-snapshot",
                null, "https://example.test/thumb.png", admin.Id, true),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _templateRepositoryMock.Verify(r => r.Add(It.Is<Template>(t =>
            t.DefaultConfigJson == version.ConfigJson && t.AuthorName == admin.FullName && t.CreatedByUserId == admin.Id)), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_RejectMissingVersion()
    {
        var owner = User.Create("owner@example.test", "hash", "Owner");
        var source = UserCustomization.Create(owner.Id, Guid.NewGuid(), "Draft", "draft", "{}");
        _customizationRepositoryMock.Setup(r => r.ReadAccessAsync(source.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CustomizationAccess(source.Id, owner.Id, source.Slug, null));
        _customizationRepositoryMock.Setup(r => r.ReadVersionAsync(source.Id, It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((CustomizationVersion?)null);

        var result = await _handler.Handle(
            new CreateCommunityTemplateCommand(source.Id, Guid.NewGuid(), Guid.NewGuid(), "Share", "share", null,
                "https://example.test/thumb.png", owner.Id, false),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(TemplateErrors.NotFound);
        _templateRepositoryMock.Verify(r => r.Add(It.IsAny<Template>()), Times.Never);
    }

    [Fact]
    public void Validator_Should_RequireTheSourceAndAValidHttpThumbnail()
    {
        var validator = new CreateCommunityTemplateCommandValidator();
        var source = new CreateCommunityTemplateCommand(Guid.Empty, Guid.Empty, Guid.Empty, "", "", null, "javascript:alert(1)", Guid.Empty, false);

        var result = validator.Validate(source);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCommunityTemplateCommand.SourceCustomizationId));
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCommunityTemplateCommand.CustomizationVersionId));
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCommunityTemplateCommand.ThumbnailUrl));
    }
}
