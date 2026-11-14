namespace OnePortal.UnitTests.Application.Customizations;

using FluentAssertions;
using Moq;
using OnePortal.Application.UseCases.V1.Customizations.Commands;
using OnePortal.Contract.Services.V1.Customizations;
using OnePortal.Contract.Services.V1.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;
using Xunit;

public class CreateCustomizationCommandHandlerTests
{
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock = new();
    private readonly Mock<ITemplateRepository> _templateRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly CreateCustomizationCommandHandler _handler;

    public CreateCustomizationCommandHandlerTests()
    {
        _handler = new CreateCustomizationCommandHandler(
            _customizationRepositoryMock.Object,
            _templateRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_CreatePrivateWorkingDraft_WhenValid()
    {
        var userId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var draftId = Guid.NewGuid();
        var template = Template.Create("T", "slug", null, "Wedding", "thumb", null, "{}");
        _customizationRepositoryMock.Setup(r => r.GetByClientDraftIdAsync(userId, draftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);
        _templateRepositoryMock.Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);
        _customizationRepositoryMock.Setup(r => r.FindSlugOwnerAsync("my-wedding", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // The legacy flag is ignored: creating a draft does not publish it.
        var command = new CreateCustomizationCommand(userId, templateId, "My Wedding", "my-wedding", "{}", true, draftId);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().NotBe(Guid.Empty);
        result.Value.Revision.Should().Be(1);
        _customizationRepositoryMock.Verify(r => r.Add(It.Is<UserCustomization>(c =>
            c.UserId == userId && c.ClientDraftId == draftId && c.Slug == "my-wedding" &&
            !c.IsPublished && c.PublishedVersionId == null)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_RejectGuestCustomizationCreation()
    {
        var command = new CreateCustomizationCommand(null, Guid.NewGuid(), "Guest", "guest", "{}", false, Guid.NewGuid());

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.Unauthorized);
        _customizationRepositoryMock.Verify(r => r.Add(It.IsAny<UserCustomization>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenTemplateDoesNotExist()
    {
        var userId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var draftId = Guid.NewGuid();
        _customizationRepositoryMock.Setup(r => r.GetByClientDraftIdAsync(userId, draftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);
        _templateRepositoryMock.Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Template?)null);

        var result = await _handler.Handle(
            new CreateCustomizationCommand(userId, templateId, "Title", "some-slug", "{}", false, draftId),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(TemplateErrors.NotFound);
        _customizationRepositoryMock.Verify(r => r.Add(It.IsAny<UserCustomization>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnDuplicateSlug_WhenSlugAliasAlreadyExists()
    {
        var userId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var draftId = Guid.NewGuid();
        _customizationRepositoryMock.Setup(r => r.GetByClientDraftIdAsync(userId, draftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);
        _templateRepositoryMock.Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Template.Create("T", "template", null, "Wedding", "thumb", null, "{}"));
        _customizationRepositoryMock.Setup(r => r.FindSlugOwnerAsync("existing-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Guid.NewGuid());

        var result = await _handler.Handle(
            new CreateCustomizationCommand(userId, templateId, "Title", "existing-slug", "{}", false, draftId),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.DuplicateSlug);
        _customizationRepositoryMock.Verify(r => r.Add(It.IsAny<UserCustomization>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnExistingDraft_WhenClientRetryRepeatsSameCreate()
    {
        var userId = Guid.NewGuid();
        var draftId = Guid.NewGuid();
        var existing = UserCustomization.Create(userId, Guid.NewGuid(), "My Wedding", "my-wedding", "{}");
        existing.SetClientDraftId(draftId);
        _customizationRepositoryMock.Setup(r => r.GetByClientDraftIdAsync(userId, draftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var result = await _handler.Handle(
            new CreateCustomizationCommand(userId, existing.TemplateId, "My Wedding", "my-wedding", "{}", false, draftId),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(existing.Id);
        result.Value.Revision.Should().Be(1);
        _templateRepositoryMock.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
