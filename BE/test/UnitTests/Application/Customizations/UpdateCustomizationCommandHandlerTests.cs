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
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly UpdateCustomizationCommandHandler _handler;

    public UpdateCustomizationCommandHandlerTests() =>
        _handler = new UpdateCustomizationCommandHandler(_customizationRepositoryMock.Object, _unitOfWorkMock.Object);

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenCustomizationDoesNotExist()
    {
        var id = Guid.NewGuid();
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);

        var result = await _handler.Handle(
            new UpdateCustomizationCommand(id, "Title", "slug", "{}", false, Guid.NewGuid(), "User", 1, Guid.NewGuid()),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_SaveOwnerDraft_AndIncrementRevision()
    {
        var ownerId = Guid.NewGuid();
        var id = Guid.NewGuid();
        var site = UserCustomization.Create(ownerId, Guid.NewGuid(), "Before", "before", "{}");
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(site);
        _customizationRepositoryMock.Setup(r => r.FindSlugOwnerAsync("after", It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var result = await _handler.Handle(
            new UpdateCustomizationCommand(id, "After", "after", "{\"theme\":{}}", false, ownerId, "User", 1, Guid.NewGuid()),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Revision.Should().Be(2);
        site.Title.Should().Be("After");
        site.Slug.Should().Be("after");
        site.PublishedVersionId.Should().BeNull();
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_AllowAdminToUpdateAnotherUsersDraft()
    {
        var site = UserCustomization.Create(Guid.NewGuid(), Guid.NewGuid(), "Before", "before", "{}");
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(site);
        _customizationRepositoryMock.Setup(r => r.FindSlugOwnerAsync("admin-updated", It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var result = await _handler.Handle(
            new UpdateCustomizationCommand(Guid.NewGuid(), "Admin Title", "admin-updated", "{}", false, Guid.NewGuid(), "Admin", 1, Guid.NewGuid()),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        site.Title.Should().Be("Admin Title");
    }

    [Fact]
    public async Task Handle_Should_RejectAnotherUser()
    {
        var site = UserCustomization.Create(Guid.NewGuid(), Guid.NewGuid(), "Owner Title", "owner", "{}");
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(site);

        var result = await _handler.Handle(
            new UpdateCustomizationCommand(Guid.NewGuid(), "Hacker", "hacker", "{}", false, Guid.NewGuid(), "User", 1, Guid.NewGuid()),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.Unauthorized);
        site.Title.Should().Be("Owner Title");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_RejectGuestUpdatingOwnerlessCustomization()
    {
        var id = Guid.NewGuid();
        var site = UserCustomization.Create(null, Guid.NewGuid(), "Guest Title", "guest", "{}");
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(site);

        var result = await _handler.Handle(
            new UpdateCustomizationCommand(id, "Changed", "changed", "{}", false, null, "User", 1, Guid.NewGuid()),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.Unauthorized);
        site.Title.Should().Be("Guest Title");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnConflict_WhenRevisionIsStale()
    {
        var ownerId = Guid.NewGuid();
        var site = UserCustomization.Create(ownerId, Guid.NewGuid(), "Current", "current", "{}");
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(site);

        var result = await _handler.Handle(
            new UpdateCustomizationCommand(Guid.NewGuid(), "Stale update", "stale", "{}", false, ownerId, "User", 0, Guid.NewGuid()),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.Conflict);
        site.Title.Should().Be("Current");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnDuplicateSlug_WhenSlugAliasBelongsToAnotherSite()
    {
        var ownerId = Guid.NewGuid();
        var siteId = Guid.NewGuid();
        var otherSiteId = Guid.NewGuid();
        var site = UserCustomization.Create(ownerId, Guid.NewGuid(), "Current", "current", "{}");
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(siteId, It.IsAny<CancellationToken>())).ReturnsAsync(site);
        _customizationRepositoryMock.Setup(r => r.FindSlugOwnerAsync("duplicate", It.IsAny<CancellationToken>())).ReturnsAsync(otherSiteId);

        var result = await _handler.Handle(
            new UpdateCustomizationCommand(siteId, "Changed", "duplicate", "{}", false, ownerId, "User", 1, Guid.NewGuid()),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.DuplicateSlug);
        site.Title.Should().Be("Current");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnPreviousRevisionForIdenticalRetry_AndConflictForChangedRetry()
    {
        var ownerId = Guid.NewGuid();
        var id = Guid.NewGuid();
        var requestId = Guid.NewGuid();
        var site = UserCustomization.Create(ownerId, Guid.NewGuid(), "Before", "before", "{}");
        _customizationRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(site);
        _customizationRepositoryMock.Setup(r => r.FindSlugOwnerAsync("after", It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        var command = new UpdateCustomizationCommand(id, "After", "after", "{}", false, ownerId, "User", 1, requestId);

        var first = await _handler.Handle(command, CancellationToken.None);
        var retry = await _handler.Handle(command, CancellationToken.None);
        var changedRetry = await _handler.Handle(command with { Title = "Changed" }, CancellationToken.None);

        first.IsSuccess.Should().BeTrue();
        retry.IsSuccess.Should().BeTrue();
        retry.Value.Revision.Should().Be(first.Value.Revision);
        changedRetry.IsFailure.Should().BeTrue();
        changedRetry.Error.Should().Be(CustomizationErrors.Conflict);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
