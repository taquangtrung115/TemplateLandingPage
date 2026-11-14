namespace OnePortal.Application.UseCases.V1.Products.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Products;
using OnePortal.Domain.Repositories;

public sealed class GetProductByIdQueryHandler : IQueryHandler<GetProductByIdQuery, ProductResponse>
{
    private readonly IProductRepository _productRepository;

    public GetProductByIdQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<ProductResponse>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetVisibleByIdAsync(request.Id, request.IncludeInactive, cancellationToken);
        if (product is null)
        {
            return Result.Failure<ProductResponse>(ProductErrors.NotFound);
        }

        var response = new ProductResponse(
            product.Id,
            product.Name,
            product.Description,
            product.Price,
            product.IsActive,
            product.CreatedAtUtc);

        return Result.Success(response);
    }
}
