namespace TemplateLandingPage.UnitTests.Application.Categories;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Categories.Commands;
using TemplateLandingPage.Contract.Services.V1.Categories;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class CategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;

    public CategoryCommandHandlerTests()
    {
        _categoryRepositoryMock = new Mock<ICategoryRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
    }

    [Fact]
    public async Task CreateCategory_Should_Succeed_WhenSlugIsUnique()
    {
        var command = new CreateCategoryCommand("Đám Cưới", "wedding", "Mô tả", "Heart", 1, true);
        _categoryRepositoryMock.Setup(r => r.ExistsBySlugAsync(command.Slug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = new CreateCategoryCommandHandler(_categoryRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _categoryRepositoryMock.Verify(r => r.Add(It.Is<Category>(c => c.Slug == command.Slug)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateCategory_Should_Fail_WhenSlugExists()
    {
        var command = new CreateCategoryCommand("Đám Cưới", "wedding", "Mô tả", "Heart", 1, true);
        _categoryRepositoryMock.Setup(r => r.ExistsBySlugAsync(command.Slug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new CreateCategoryCommandHandler(_categoryRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(CategoryErrors.DuplicateSlug);
    }

    [Fact]
    public async Task UpdateCategory_Should_Succeed_WhenValid()
    {
        var category = Category.Create("Cũ", "cu", null, null, 1, true);
        var command = new UpdateCategoryCommand(category.Id, "Mới", "moi", "Mô tả mới", "Star", 2, true);

        _categoryRepositoryMock.Setup(r => r.GetByIdAsync(category.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(category);
        _categoryRepositoryMock.Setup(r => r.GetBySlugAsync("moi", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = new UpdateCategoryCommandHandler(_categoryRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        category.Name.Should().Be("Mới");
        category.Slug.Should().Be("moi");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateCategory_Should_Fail_WhenNotFound()
    {
        var command = new UpdateCategoryCommand(Guid.NewGuid(), "Mới", "moi", null, null, 1, true);
        _categoryRepositoryMock.Setup(r => r.GetByIdAsync(command.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);

        var handler = new UpdateCategoryCommandHandler(_categoryRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task DeleteCategory_Should_Succeed_WhenNoAssociatedTemplates()
    {
        var category = Category.Create("Danh mục", "danh-muc", null, null, 1, true);
        var command = new DeleteCategoryCommand(category.Id);

        _categoryRepositoryMock.Setup(r => r.GetByIdAsync(category.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(category);
        _categoryRepositoryMock.Setup(r => r.HasAssociatedTemplatesAsync(category.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = new DeleteCategoryCommandHandler(_categoryRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        category.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateCategory_Should_Fail_WhenSlugExistsForDifferentCategory()
    {
        var category = Category.Create("Cũ", "cu", null, null, 1, true);
        var otherCategory = Category.Create("Khác", "trung-slug", null, null, 2, true);
        var command = new UpdateCategoryCommand(category.Id, "Mới", "trung-slug", null, null, 1, true);

        _categoryRepositoryMock.Setup(r => r.GetByIdAsync(category.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(category);
        _categoryRepositoryMock.Setup(r => r.GetBySlugAsync("trung-slug", It.IsAny<CancellationToken>()))
            .ReturnsAsync(otherCategory);

        var handler = new UpdateCategoryCommandHandler(_categoryRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(CategoryErrors.DuplicateSlug);
    }

    [Fact]
    public async Task DeleteCategory_Should_Fail_WhenNotFound()
    {
        var nonExistentId = Guid.NewGuid();
        var command = new DeleteCategoryCommand(nonExistentId);

        _categoryRepositoryMock.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);

        var handler = new DeleteCategoryCommandHandler(_categoryRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task DeleteCategory_Should_Fail_WhenHasAssociatedTemplates()
    {
        var category = Category.Create("Danh mục", "danh-muc", null, null, 1, true);
        var command = new DeleteCategoryCommand(category.Id);

        _categoryRepositoryMock.Setup(r => r.GetByIdAsync(category.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(category);
        _categoryRepositoryMock.Setup(r => r.HasAssociatedTemplatesAsync(category.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new DeleteCategoryCommandHandler(_categoryRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(CategoryErrors.HasAssociatedTemplates);
    }
}
