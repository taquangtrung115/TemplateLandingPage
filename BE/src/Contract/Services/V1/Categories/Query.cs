namespace OnePortal.Contract.Services.V1.Categories;

using OnePortal.Contract.Abstractions.Message;

public record GetCategoriesQuery(bool? IsActiveOnly = null) : IQuery<List<CategoryResponse>>;

public record GetCategoryByIdQuery(Guid Id, bool IncludeInactive = false) : IQuery<CategoryResponse>;

public record GetCategoryBySlugQuery(string Slug, bool IncludeInactive = false) : IQuery<CategoryResponse>;
