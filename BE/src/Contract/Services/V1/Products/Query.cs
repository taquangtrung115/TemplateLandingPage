namespace OnePortal.Contract.Services.V1.Products;

using OnePortal.Contract.Abstractions.Message;

public record GetProductsQuery(bool IncludeInactive = false) : IQuery<List<ProductResponse>>;

public record GetProductByIdQuery(Guid Id, bool IncludeInactive = false) : IQuery<ProductResponse>;
