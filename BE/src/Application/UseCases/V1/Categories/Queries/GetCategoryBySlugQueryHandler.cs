namespace TemplateLandingPage.Application.UseCases.V1.Categories.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Categories;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetCategoryBySlugQueryHandler : IQueryHandler<GetCategoryBySlugQuery, CategoryResponse>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoryBySlugQueryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<CategoryResponse>> Handle(GetCategoryBySlugQuery request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (category is null)
        {
            return Result.Failure<CategoryResponse>(CategoryErrors.NotFound);
        }

        var response = new CategoryResponse(
            category.Id,
            category.Name,
            category.Slug,
            category.Description,
            category.Icon,
            category.OrderIndex,
            category.IsActive,
            category.Templates?.Count(t => !t.IsDeleted) ?? 0,
            category.CreatedAtUtc);

        return Result.Success(response);
    }
}
