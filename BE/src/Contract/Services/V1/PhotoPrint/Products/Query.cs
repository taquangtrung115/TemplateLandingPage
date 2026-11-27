namespace OnePortal.Contract.Services.V1.PhotoPrint.Products;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetCategoriesQuery(bool IncludeInactive) : IQuery<object>;

public sealed record SearchProductsQuery(PhotoCatalogFilter Filter) : IQuery<object>;

public sealed record GetProductQuery(string Slug) : IQuery<object>;
