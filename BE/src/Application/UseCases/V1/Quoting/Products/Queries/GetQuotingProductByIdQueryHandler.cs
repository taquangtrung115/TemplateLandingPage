namespace OnePortal.Application.UseCases.V1.Quoting.Products.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Products;
using OnePortal.Domain.Repositories.Quoting;

public sealed class GetQuotingProductByIdQueryHandler : IQueryHandler<GetQuotingProductByIdQuery, QuotingProductResponse>
{
    private readonly IQuotingProductRepository _productRepository;

    public GetQuotingProductByIdQueryHandler(IQuotingProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<QuotingProductResponse>> Handle(GetQuotingProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetForReadAsync(request.Id, cancellationToken);
        if (product is null || product.IsDeleted)
        {
            return Result.Failure<QuotingProductResponse>(QuotingProductErrors.NotFound);
        }

        var response = new QuotingProductResponse(
            product.Id,
            product.Code,
            product.Name,
            product.Description,
            product.Unit,
            product.Price,
            product.ImageUrl,
            product.Group?.Name ?? product.Category,
            product.IsActive,
            product.CreatedAtUtc,
            product.ModifiedAtUtc, product.GroupId, product.Group?.SortOrder ?? 0);

        return Result.Success(response);
    }
}
