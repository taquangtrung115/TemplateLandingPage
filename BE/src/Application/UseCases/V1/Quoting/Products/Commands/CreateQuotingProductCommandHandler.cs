namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Commands;

using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Products;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class CreateQuotingProductCommandHandler : ICommandHandler<CreateQuotingProductCommand, Guid>
{
    private readonly IQuotingProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateQuotingProductCommandHandler> _logger;

    public CreateQuotingProductCommandHandler(
        IQuotingProductRepository productRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateQuotingProductCommandHandler> logger)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateQuotingProductCommand request, CancellationToken cancellationToken)
    {
        var isUnique = await _productRepository.IsCodeUniqueAsync(request.Code, cancellationToken: cancellationToken);
        if (!isUnique)
        {
            return Result.Failure<Guid>(QuotingProductErrors.DuplicateCode);
        }

        var product = QuotingProduct.Create(
            request.Code,
            request.Name,
            request.Description,
            request.Unit,
            request.Price,
            request.ImageUrl,
            request.Category,
            request.IsActive);

        _productRepository.Add(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quoting product {ProductId} ({Code}) created successfully", product.Id, product.Code);

        return Result.Success(product.Id);
    }
}
