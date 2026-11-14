namespace OnePortal.Application.UseCases.V1.Quoting.Products.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Products;
using OnePortal.Domain.Repositories.Quoting;

public sealed class GetQuotingProductsQueryHandler : IQueryHandler<GetQuotingProductsQuery, List<QuotingProductResponse>>
{
    private readonly IQuotingProductRepository _productRepository;

    public GetQuotingProductsQueryHandler(IQuotingProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<List<QuotingProductResponse>>> Handle(GetQuotingProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _productRepository.SearchAsync(
            request.SearchTerm,
            request.Category,
            request.IncludeInactive,
            cancellationToken);

        var response = products.Select(p => new QuotingProductResponse(
            p.Id,
            p.Code,
            p.Name,
            p.Description,
            p.Unit,
            p.Price,
            p.ImageUrl,
            p.Group?.Name ?? p.Category,
            p.IsActive,
            p.CreatedAtUtc,
            p.ModifiedAtUtc, p.GroupId, p.Group?.SortOrder ?? 0)).ToList();

        return Result.Success(response);
    }
}
