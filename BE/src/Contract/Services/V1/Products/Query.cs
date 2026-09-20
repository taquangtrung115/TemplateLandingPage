namespace TemplateLandingPage.Contract.Services.V1.Products;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetProductsQuery() : IQuery<List<ProductResponse>>;

public record GetProductByIdQuery(Guid Id) : IQuery<ProductResponse>;
