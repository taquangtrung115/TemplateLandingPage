namespace OnePortal.Application.UseCases.V1.Categories.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Categories;
using OnePortal.Domain.Repositories;

public sealed class GetCategoryBySlugQueryHandler : IQueryHandler<GetCategoryBySlugQuery, CategoryResponse>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoryBySlugQueryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<CategoryResponse>> Handle(GetCategoryBySlugQuery request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetSummaryBySlugAsync(request.Slug, request.IncludeInactive, cancellationToken);
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
            category.TemplatesCount,
            category.CreatedAtUtc);

        return Result.Success(response);
    }
}
