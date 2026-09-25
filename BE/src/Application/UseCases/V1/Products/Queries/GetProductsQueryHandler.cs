namespace TemplateLandingPage.Application.UseCases.V1.Products.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Products;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetProductsQueryHandler : IQueryHandler<GetProductsQuery, List<ProductResponse>>
{
    private readonly IProductRepository _productRepository;

    public GetProductsQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<List<ProductResponse>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetVisibleAsync(request.IncludeInactive, cancellationToken);

        var response = products
            .Select(p => new ProductResponse(
                p.Id,
                p.Name,
                p.Description,
                p.Price,
                p.IsActive,
                p.CreatedAtUtc))
            .ToList();

        return Result.Success(response);
    }
}
