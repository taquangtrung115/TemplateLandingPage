namespace TemplateLandingPage.UnitTests.Application.Templates;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Templates.Queries;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.ReadModels;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class GetTemplatesQueryHandlerTests
{
    private readonly Mock<ITemplateRepository> _templateRepositoryMock;
    private readonly GetTemplatesQueryHandler _handler;

    public GetTemplatesQueryHandlerTests()
    {
        _templateRepositoryMock = new Mock<ITemplateRepository>();
        _handler = new GetTemplatesQueryHandler(_templateRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnAllTemplates_WhenNoFilterSpecified()
    {
        // Arrange
        var t1 = Template.Create("Wedding 1", "w-1", "Desc 1", "Wedding", "thumb1", null, "{}");
        var t2 = Template.Create("Birthday 1", "b-1", "Desc 2", "Birthday", "thumb2", null, "{}");

        _templateRepositoryMock.Setup(r => r.GetListAsync(
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<bool?>(),
            It.IsAny<bool?>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(ToSummaries(t1, t2));

        var query = new GetTemplatesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_Should_FilterByCategory_WhenCategoryProvided()
    {
        // Arrange
        var t1 = Template.Create("Wedding 1", "w-1", "Desc 1", "Wedding", "thumb1", null, "{}");

        _templateRepositoryMock.Setup(r => r.GetListAsync(
            "Wedding",
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<bool?>(),
            It.IsAny<bool?>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(ToSummaries(t1));

        var query = new GetTemplatesQuery(Category: "Wedding");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].Category.Should().Be("Wedding");
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoTemplatesExist()
    {
        // Arrange
        _templateRepositoryMock.Setup(r => r.GetListAsync(
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<bool?>(),
            It.IsAny<bool?>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TemplateSummary>());

        var query = new GetTemplatesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_Should_FilterByCategoryId_WhenCategoryIdProvided()
    {
        // Arrange
        var catId = Guid.NewGuid();
        var t1 = Template.Create("Wedding 1", "w-1", "Desc", catId, "Wedding", "thumb", null, null, "HOT", null, null, "{}");

        _templateRepositoryMock.Setup(r => r.GetListAsync(
            null,
            catId,
            null,
            null,
            null,
            null,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(ToSummaries(t1));

        var query = new GetTemplatesQuery(CategoryId: catId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].CategoryId.Should().Be(catId);
    }

    [Fact]
    public async Task Handle_Should_FilterByBadge_WhenBadgeProvided()
    {
        // Arrange
        var t1 = Template.Create("Wedding Premium", "w-prem", "Desc", null, "Wedding", "thumb", null, null, "PREMIUM", null, null, "{}");

        _templateRepositoryMock.Setup(r => r.GetListAsync(
            null,
            null,
            "PREMIUM",
            null,
            null,
            null,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(ToSummaries(t1));

        var query = new GetTemplatesQuery(Badge: "PREMIUM");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].Badge.Should().Be("PREMIUM");
    }

    [Fact]
    public async Task Handle_Should_FilterBySearch_WhenSearchProvided()
    {
        // Arrange
        var t1 = Template.Create("Golden Luxury", "golden-lux", "Thiệp cưới sang trọng", null, "Wedding", "thumb", null, null, null, null, null, "{}");

        _templateRepositoryMock.Setup(r => r.GetListAsync(
            null,
            null,
            null,
            "Luxury",
            null,
            null,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(ToSummaries(t1));

        var query = new GetTemplatesQuery(Search: "Luxury");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].Name.Should().Be("Golden Luxury");
    }

    [Fact]
    public async Task Handle_Should_FilterByCommunity_WhenIsCommunityProvided()
    {
        // Arrange
        var t1 = Template.CreateCommunity("Community 1", "comm-1", "Desc", "Wedding", "thumb", "{}", "Author A");

        _templateRepositoryMock.Setup(r => r.GetListAsync(
            null,
            null,
            null,
            null,
            null,
            true,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(ToSummaries(t1));

        var query = new GetTemplatesQuery(IsCommunity: true);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].IsCommunity.Should().BeTrue();
        result.Value[0].AuthorName.Should().Be("Author A");
    }

    [Fact]
    public async Task Handle_Should_FilterByCommunityFalse_WhenIsCommunityIsFalse()
    {
        // Arrange
        var t1 = Template.Create("Official Template", "official-1", "Desc", "Wedding", "thumb", null, "{}");

        _templateRepositoryMock.Setup(r => r.GetListAsync(
            null,
            null,
            null,
            null,
            null,
            false,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(ToSummaries(t1));

        var query = new GetTemplatesQuery(IsCommunity: false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].IsCommunity.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_Should_PassNullCommunity_WhenIsCommunityNotSpecified()
    {
        // Arrange
        var tOfficial = Template.Create("Official Template", "official-1", "Desc", "Wedding", "thumb", null, "{}");
        var tCommunity = Template.CreateCommunity("Community Template", "comm-1", "Desc", "Wedding", "thumb", "{}", "Author B");

        _templateRepositoryMock.Setup(r => r.GetListAsync(
            null,
            null,
            null,
            null,
            null,
            null,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(ToSummaries(tOfficial, tCommunity));

        var query = new GetTemplatesQuery(IsCommunity: null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value.Should().Contain(t => t.IsCommunity == false);
        result.Value.Should().Contain(t => t.IsCommunity == true && t.AuthorName == "Author B");
    }

    private static List<TemplateSummary> ToSummaries(params Template[] templates) => templates
        .Select(t => new TemplateSummary(
            t.Id, t.Name, t.Slug, t.Description, t.CategoryId, t.Category, t.ThumbnailUrl,
            t.PreviewUrl, t.LongPreviewUrl, t.Badge, t.AudioUrl, t.MusicTitle, t.IsActive,
            t.IsCommunity, t.AuthorName, t.CreatedAtUtc))
        .ToList();
}

