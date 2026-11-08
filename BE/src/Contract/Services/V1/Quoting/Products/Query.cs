namespace TemplateLandingPage.Contract.Services.V1.Quoting.Products;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetQuotingProductsQuery(
    string? SearchTerm = null,
    string? Category = null,
    bool IncludeInactive = false) : IQuery<List<QuotingProductResponse>>;

public record GetQuotingProductByIdQuery(Guid Id) : IQuery<QuotingProductResponse>;
