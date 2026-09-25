namespace TemplateLandingPage.UnitTests.Application.Categories;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Categories.Queries;
using TemplateLandingPage.Contract.Services.V1.Categories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.ReadModels;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class CategoryQueryHandlerTests
{
    private readonly Mock<ICategoryRepository> _categoryRepositoryMock;

    public CategoryQueryHandlerTests()
    {
        _categoryRepositoryMock = new Mock<ICategoryRepository>();
    }

    [Fact]
    public async Task GetCategories_Should_ReturnMappedList_WithTemplateCounts()
    {
        // Arrange
        var cat1 = Category.Create("Đám Cưới", "wedding", "Mẫu đám cưới", "Heart", 1, true);
        var cat2 = Category.Create("Sinh Nhật", "birthday", "Mẫu sinh nhật", "Cake", 2, true);

        _categoryRepositoryMock.Setup(r => r.GetSummariesAsync(false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategorySummary>
            {
                new(cat1.Id, cat1.Name, cat1.Slug, cat1.Description, cat1.Icon, cat1.OrderIndex, cat1.IsActive, 0, cat1.CreatedAtUtc),
                new(cat2.Id, cat2.Name, cat2.Slug, cat2.Description, cat2.Icon, cat2.OrderIndex, cat2.IsActive, 0, cat2.CreatedAtUtc)
            });

        var handler = new GetCategoriesQueryHandler(_categoryRepositoryMock.Object);
        var query = new GetCategoriesQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value[0].Name.Should().Be("Đám Cưới");
        result.Value[0].Slug.Should().Be("wedding");
        result.Value[0].TemplateCount.Should().Be(0);
        result.Value[1].Name.Should().Be("Sinh Nhật");
    }

    [Fact]
    public async Task GetCategories_Should_FilterActive_WhenIsActiveOnlyIsTrue()
    {
        // Arrange
        var cat = Category.Create("Đám Cưới", "wedding", null, null, 1, true);
        _categoryRepositoryMock.Setup(r => r.GetSummariesAsync(false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategorySummary>
            {
                new(cat.Id, cat.Name, cat.Slug, cat.Description, cat.Icon, cat.OrderIndex, cat.IsActive, 0, cat.CreatedAtUtc)
            });

        var handler = new GetCategoriesQueryHandler(_categoryRepositoryMock.Object);
        var query = new GetCategoriesQuery(IsActiveOnly: true);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        _categoryRepositoryMock.Verify(r => r.GetSummariesAsync(false, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCategoryById_Should_ReturnCategory_WhenFound()
    {
        // Arrange
        var cat = Category.Create("Đám Cưới", "wedding", "Mô tả", "Heart", 1, true);
        _categoryRepositoryMock.Setup(r => r.GetSummaryByIdAsync(cat.Id, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CategorySummary(cat.Id, cat.Name, cat.Slug, cat.Description, cat.Icon, cat.OrderIndex, cat.IsActive, 0, cat.CreatedAtUtc));

        var handler = new GetCategoryByIdQueryHandler(_categoryRepositoryMock.Object);
        var query = new GetCategoryByIdQuery(cat.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(cat.Id);
        result.Value.Name.Should().Be("Đám Cưới");
        result.Value.Slug.Should().Be("wedding");
    }

    [Fact]
    public async Task GetCategoryById_Should_ReturnNotFound_WhenMissing()
    {
        // Arrange
        var id = Guid.NewGuid();
        _categoryRepositoryMock.Setup(r => r.GetSummaryByIdAsync(id, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync((CategorySummary?)null);

        var handler = new GetCategoryByIdQueryHandler(_categoryRepositoryMock.Object);
        var query = new GetCategoryByIdQuery(id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task GetCategoryBySlug_Should_ReturnCategory_WhenFound()
    {
        // Arrange
        var cat = Category.Create("Đám Cưới", "wedding", "Mô tả", "Heart", 1, true);
        _categoryRepositoryMock.Setup(r => r.GetSummaryBySlugAsync("wedding", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CategorySummary(cat.Id, cat.Name, cat.Slug, cat.Description, cat.Icon, cat.OrderIndex, cat.IsActive, 0, cat.CreatedAtUtc));

        var handler = new GetCategoryBySlugQueryHandler(_categoryRepositoryMock.Object);
        var query = new GetCategoryBySlugQuery("wedding");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Slug.Should().Be("wedding");
        result.Value.Name.Should().Be("Đám Cưới");
    }

    [Fact]
    public async Task GetCategoryBySlug_Should_ReturnNotFound_WhenMissing()
    {
        // Arrange
        _categoryRepositoryMock.Setup(r => r.GetSummaryBySlugAsync("non-existent", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync((CategorySummary?)null);

        var handler = new GetCategoryBySlugQueryHandler(_categoryRepositoryMock.Object);
        var query = new GetCategoryBySlugQuery("non-existent");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(CategoryErrors.NotFound);
    }
}
