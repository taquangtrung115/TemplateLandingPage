namespace TemplateLandingPage.UnitTests.Application.Templates;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Templates.Queries;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Entities;
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

        _templateRepositoryMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Template> { t1, t2 });

        var query = new GetTemplatesQuery(null, null);

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
        var t2 = Template.Create("Birthday 1", "b-1", "Desc 2", "Birthday", "thumb2", null, "{}");

        _templateRepositoryMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Template> { t1, t2 });

        var query = new GetTemplatesQuery("Wedding", null);

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
        _templateRepositoryMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Template>());

        var query = new GetTemplatesQuery(null, null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }
}
