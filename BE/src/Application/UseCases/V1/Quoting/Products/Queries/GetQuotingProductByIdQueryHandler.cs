namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Products;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class GetQuotingProductByIdQueryHandler : IQueryHandler<GetQuotingProductByIdQuery, QuotingProductResponse>
{
    private readonly IQuotingProductRepository _productRepository;

    public GetQuotingProductByIdQueryHandler(IQuotingProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<QuotingProductResponse>> Handle(GetQuotingProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
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
            product.Category,
            product.IsActive,
            product.CreatedAtUtc,
            product.ModifiedAtUtc);

        return Result.Success(response);
    }
}
