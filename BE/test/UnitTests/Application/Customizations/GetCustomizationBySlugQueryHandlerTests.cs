namespace TemplateLandingPage.UnitTests.Application.Customizations;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Queries;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class GetCustomizationBySlugQueryHandlerTests
{
    private readonly Mock<ICustomizationRepository> _customizationRepositoryMock;
    private readonly Mock<ITemplateRepository> _templateRepositoryMock;
    private readonly GetCustomizationBySlugQueryHandler _handler;

    public GetCustomizationBySlugQueryHandlerTests()
    {
        _customizationRepositoryMock = new Mock<ICustomizationRepository>();
        _templateRepositoryMock = new Mock<ITemplateRepository>();
        _handler = new GetCustomizationBySlugQueryHandler(
            _customizationRepositoryMock.Object,
            _templateRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnCustomization_WhenSlugExists()
    {
        // Arrange
        var templateId = Guid.NewGuid();
        var template = Template.Create("Elegance Blossom", "elegance-blossom", null, "Wedding", "thumb", null, "{}");
        var customization = UserCustomization.Create(
            Guid.NewGuid(),
            templateId,
            "Romeo & Juliet",
            "romeo-juliet",
            "{\"hero\":{\"title\":\"Romeo & Juliet\"}}",
            true);

        _customizationRepositoryMock.Setup(r => r.GetBySlugAsync("romeo-juliet", It.IsAny<CancellationToken>()))
            .ReturnsAsync(customization);
        _templateRepositoryMock.Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        var query = new GetCustomizationBySlugQuery("romeo-juliet");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Slug.Should().Be("romeo-juliet");
        result.Value.Title.Should().Be("Romeo & Juliet");
        result.Value.TemplateName.Should().Be("Elegance Blossom");
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenSlugDoesNotExist()
    {
        // Arrange
        _customizationRepositoryMock.Setup(r => r.GetBySlugAsync("non-existent-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCustomization?)null);

        var query = new GetCustomizationBySlugQuery("non-existent-slug");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(CustomizationErrors.NotFound);
    }
}
