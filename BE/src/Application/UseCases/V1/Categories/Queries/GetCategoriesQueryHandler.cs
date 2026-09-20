namespace TemplateLandingPage.Application.UseCases.V1.Categories.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Categories;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetCategoriesQueryHandler : IQueryHandler<GetCategoriesQuery, List<CategoryResponse>>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoriesQueryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<List<CategoryResponse>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _categoryRepository.GetAllOrderedAsync(request.IsActiveOnly, cancellationToken);

        var response = categories.Select(c => new CategoryResponse(
            c.Id,
            c.Name,
            c.Slug,
            c.Description,
            c.Icon,
            c.OrderIndex,
            c.IsActive,
            c.Templates?.Count(t => !t.IsDeleted) ?? 0,
            c.CreatedAtUtc)).ToList();

        return Result.Success(response);
    }
}
