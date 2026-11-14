namespace OnePortal.Application.UseCases.V1.Quoting.Products.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Products;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories.Quoting;

public sealed class DeleteQuotingProductCommandHandler : ICommandHandler<DeleteQuotingProductCommand>
{
    private readonly IQuotingProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteQuotingProductCommandHandler> _logger;

    public DeleteQuotingProductCommandHandler(
        IQuotingProductRepository productRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteQuotingProductCommandHandler> logger)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteQuotingProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product is null || product.IsDeleted)
        {
            return Result.Failure(QuotingProductErrors.NotFound);
        }

        product.Delete();
        _productRepository.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quoting product {ProductId} deleted successfully", product.Id);

        return Result.Success();
    }
}
