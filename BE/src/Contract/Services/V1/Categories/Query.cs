namespace TemplateLandingPage.Contract.Services.V1.Categories;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetCategoriesQuery(bool? IsActiveOnly = null) : IQuery<List<CategoryResponse>>;

public record GetCategoryByIdQuery(Guid Id) : IQuery<CategoryResponse>;

public record GetCategoryBySlugQuery(string Slug) : IQuery<CategoryResponse>;
