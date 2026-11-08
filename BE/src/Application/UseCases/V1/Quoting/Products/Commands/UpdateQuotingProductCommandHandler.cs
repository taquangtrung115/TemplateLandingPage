namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Commands;

using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Products;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class UpdateQuotingProductCommandHandler : ICommandHandler<UpdateQuotingProductCommand>
{
    private readonly IQuotingProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateQuotingProductCommandHandler> _logger;

    public UpdateQuotingProductCommandHandler(
        IQuotingProductRepository productRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateQuotingProductCommandHandler> logger)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateQuotingProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product is null || product.IsDeleted)
        {
            return Result.Failure(QuotingProductErrors.NotFound);
        }

        var isUnique = await _productRepository.IsCodeUniqueAsync(request.Code, request.Id, cancellationToken);
        if (!isUnique)
        {
            return Result.Failure(QuotingProductErrors.DuplicateCode);
        }

        product.Update(
            request.Code,
            request.Name,
            request.Description,
            request.Unit,
            request.Price,
            request.ImageUrl,
            request.Category,
            request.IsActive);

        _productRepository.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quoting product {ProductId} updated successfully", product.Id);

        return Result.Success();
    }
}
