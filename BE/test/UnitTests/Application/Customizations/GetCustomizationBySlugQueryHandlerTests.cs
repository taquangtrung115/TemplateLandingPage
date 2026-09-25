namespace TemplateLandingPage.UnitTests.Application.Customizations;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Queries;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.ReadModels;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class GetCustomizationBySlugQueryHandlerTests
{
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock = new();
    private readonly GetCustomizationBySlugQueryHandler _handler;

    public GetCustomizationBySlugQueryHandlerTests() =>
        _handler = new GetCustomizationBySlugQueryHandler(_customizationRepositoryMock.Object);

    [Fact]
    public async Task Handle_Should_ReturnOnlyPublishedVersionSnapshot()
    {
        var siteId = Guid.NewGuid();
        var versionId = Guid.NewGuid();
        const string configJson = "{\"hero\":{\"title\":\"Romeo & Juliet\"}}";
        _customizationRepositoryMock.Setup(r => r.GetPublicAsync("romeo-juliet", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PublishedCustomization(siteId, versionId, 1, Guid.NewGuid(), "Romeo & Juliet", "romeo-juliet", configJson));

        var result = await _handler.Handle(new GetCustomizationBySlugQuery("romeo-juliet"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(siteId);
        result.Value.VersionId.Should().Be(versionId);
        result.Value.VersionNumber.Should().Be(1);
        result.Value.ConfigJson.Should().Be(configJson);
        result.Value.PublicUrl.Should().Be("/p/romeo-juliet");
        _customizationRepositoryMock.Verify(r => r.GetPublicAsync("romeo-juliet", null, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenNoPublicVersionExists()
    {
        _customizationRepositoryMock.Setup(r => r.GetPublicAsync("private-site", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PublishedCustomization?)null);

        var result = await _handler.Handle(new GetCustomizationBySlugQuery("private-site"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_BuildVersionUrlForExplicitPublishedVersion()
    {
        var version = new PublishedCustomization(Guid.NewGuid(), Guid.NewGuid(), 4, Guid.NewGuid(), "Snapshot", "renamed-slug", "{}");
        _customizationRepositoryMock.Setup(r => r.GetPublicAsync("old-alias", 4, It.IsAny<CancellationToken>())).ReturnsAsync(version);

        var result = await _handler.Handle(new GetCustomizationBySlugQuery("old-alias", 4), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.PublicUrl.Should().Be("/p/renamed-slug/v/4");
    }
}
