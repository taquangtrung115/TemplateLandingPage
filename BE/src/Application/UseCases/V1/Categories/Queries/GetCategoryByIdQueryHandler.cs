namespace TemplateLandingPage.Application.UseCases.V1.Categories.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Categories;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetCategoryByIdQueryHandler : IQueryHandler<GetCategoryByIdQuery, CategoryResponse>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoryByIdQueryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<CategoryResponse>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
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
